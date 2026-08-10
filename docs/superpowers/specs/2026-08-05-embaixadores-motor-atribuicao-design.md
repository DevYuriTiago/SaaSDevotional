# Fatia 1 — Motor de atribuição de embaixadores (design)

> **Programa de Embaixadores Humanáh** — este é o design da **primeira fatia**.
> Contexto e visão geral do programa: [`docs/embaixadores.md`](../../embaixadores.md).
> Branch: `feature/embaixadores` (a partir de `homolog`).
> Data: 2026-08-05.

## 1. Objetivo desta fatia

Construir **o encanamento do dinheiro**: o caminho invisível que liga um
**clique num link de embaixador → cadastro → pagamento → crédito ao embaixador**,
de ponta a ponta e testável — usando **1 embaixador criado manualmente** (via SQL),
sem nenhuma UI de landing/portal/admin ainda.

É a fundação da qual todas as fatias seguintes dependem. Sem ela, landing e portal
são fachada; com ela, o negócio já "conta dinheiro" corretamente.

### Fora de escopo (fatias posteriores, cada uma no seu ciclo)
Landing `/embaixadores`, formulário de inscrição, curadoria/admin, portal do
embaixador, cálculo de nível/comissão gamificada, **fila e envio de saque**,
kit de divulgação, exportação (PDF), antifraude avançado.

## 2. Decisões travadas

- **Crédito via consulta à tabela (abordagem A).** Quando cai um pagamento, o
  webhook consulta `attributions` do usuário pagante e, se houver embaixador
  vinculado, grava a conversão. A tabela `attributions` é a **fonte única de
  verdade**; o `checkout/session` **não é alterado**. (Alternativa rejeitada:
  carimbar `ambassador_id` na metadata do Stripe — criaria duas fontes de verdade
  que podem divergir.)
- **Pagamento ao embaixador é MANUAL.** O sistema *credita/calcula* sozinho
  (automático); o **envio do Pix é feito à mão** pelo dono do negócio (Stripe não
  faz Pix PF de forma simples; automatizar exigiria Asaas/Mercado Pago/Pagar.me com
  KYC e risco de fraude — opcional só se o volume crescer muito). O painel admin
  (fatia futura) mostra a fila mastigada: chave Pix + valor liberado + "marcar pago".
- **Fatia 1 não calcula comissão.** Guarda o **valor bruto** pago. A % (que depende
  do nível/lifetime) e o saldo são calculados na fatia de saque. Aqui só se responde:
  *"quem ganhou crédito, em qual pagamento, de quanto foi o bruto"*.
- **First-touch.** Quem trouxe o usuário **primeiro** leva o crédito. Garantido por
  `UNIQUE(user_id)` em `attributions` — nunca sobrescreve.
- **Só CONTA NOVA é atribuível** (anti-fraude). A atribuição só vale para uma conta
  criada a partir do clique (janela de 24h sobre `profiles.created_at`). Uma conta
  preexistente que clica num link depois **nunca** é creditada a um embaixador —
  senão o embaixador "rouba" usuários que já eram seus. `captureAttribution` valida
  a idade da conta antes de gravar.
- **RLS negado por padrão.** As 5 tabelas são de negócio → só o `service_role`
  (servidor) lê/escreve. Nada exposto a `anon`/`authenticated`. O acesso do
  embaixador aos *próprios* dados chega na fatia do portal.

## 3. Modelo de dados

Migration nova: `supabase/migrations/009_ambassadors.sql`. Convenções iguais às
existentes: `uuid` PK `default gen_random_uuid()`, `timestamptz ... default now()`,
RLS habilitado em todas.

### `ambassadors` — o embaixador
| Campo | Tipo | Nota |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid → auth.users `on delete set null` | **nulo** até ter login de portal (fatia futura) |
| `name` | text not null | |
| `email` | text | |
| `whatsapp` | text | |
| `pix_key` | text | usado só no envio manual do saque (fatia futura) |
| `status` | text not null default `'active'` | check in (`pending`,`active`,`suspended`) |
| `created_at` | timestamptz | |

Em Fatia 1 criamos o embaixador de teste já como `active`. O fluxo `pending` →
curadoria chega com o formulário.

### `ambassador_links` — link compartilhável (1 embaixador pode ter vários)
| Campo | Tipo | Nota |
|---|---|---|
| `id` | uuid PK | |
| `ambassador_id` | uuid → ambassadors `on delete cascade` not null | |
| `slug` | text not null **UNIQUE** | o `<slug>` de `/e/<slug>` |
| `destination` | text not null default `'/'` | para onde faz 302 |
| `active` | boolean not null default true | |
| `created_at` | timestamptz | |

### `link_clicks` — log cru de cliques
| Campo | Tipo | Nota |
|---|---|---|
| `id` | uuid PK | |
| `link_id` | uuid → ambassador_links `on delete cascade` not null | |
| `clicked_at` | timestamptz default now() | |
| `ip_hash` | text | IP **hasheado** (LGPD) — nunca o IP cru |
| `country` | text | dos headers |
| `device` | text | user-agent resumido |
| `referrer` | text | |

### `attributions` — usuário → embaixador (first-touch)
| Campo | Tipo | Nota |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid → auth.users `on delete cascade` not null **UNIQUE** | UNIQUE = first-touch |
| `ambassador_id` | uuid → ambassadors `on delete cascade` not null | denormalizado do link p/ creditar mesmo se o link sumir |
| `link_id` | uuid → ambassador_links `on delete set null` | |
| `first_touch_at` | timestamptz default now() | |

### `conversions` — 1 linha por fatura paga, creditada ao embaixador
| Campo | Tipo | Nota |
|---|---|---|
| `id` | uuid PK | |
| `ambassador_id` | uuid → ambassadors `on delete cascade` not null | |
| `user_id` | uuid → auth.users `on delete set null` | mantém histórico se o usuário sair |
| `stripe_invoice_id` | text **UNIQUE** | idempotência: nunca credita a mesma fatura 2x |
| `stripe_event_type` | text | `checkout.session.completed` / `invoice.payment_succeeded` |
| `gross_amount_cents` | integer not null | valor bruto pago (comissão calculada depois) |
| `currency` | text not null default `'brl'` | |
| `status` | text not null default `'pending'` | check in (`pending`,`confirmed`,`refunded`); vira `confirmed` após janela de reembolso — lógica em fatia futura |
| `occurred_at` | timestamptz default now() | |

### RLS
Todas as 5 tabelas: `enable row level security` **sem policies permissivas** para
`anon`/`authenticated` → negado por padrão. Todo acesso é via `service_role` no
servidor (ignora RLS). Escritas anônimas (o clique em `/e/<slug>`) também usam o
client admin no servidor.

## 4. As 3 peças do fluxo

### Peça 1 — `/e/[slug]` (rota pública do link)
Arquivo novo: `src/app/e/[slug]/route.ts` (Route Handler, `GET`).
1. Lê `slug` do path.
2. Com client admin, busca `ambassador_links` por `slug` **ativo**.
3. **Achou:** insere `link_clicks` (IP hasheado a partir de `x-forwarded-for`,
   país/device/referrer dos headers) + seta cookie `hmn_ref = <link_id>`
   (`httpOnly`, `secure`, `sameSite=lax`, `maxAge` 90 dias) + **302 → `destination`**.
4. **Não achou / inativo:** **302 → `/`** mesmo assim (não vaza existência do slug,
   não gera erro).

Cookie httpOnly de propósito: a captura (peça 2) é feita **no servidor**, não em JS.

### Peça 2 — captura no cadastro (first-touch)
Arquivo novo: `src/app/api/ambassador/attach/route.ts` (`POST`), no espírito do
`referral/attach` já existente. Disparado **uma vez** no `/onboarding` (que roda
1x por usuário novo, tanto no cadastro por e-mail quanto por Google).
1. Lê o cookie `hmn_ref` **no servidor** (`next/headers` `cookies()`). Sem cookie → `ok:false`.
2. Pega o usuário logado (`supabase.auth.getUser`). Sem usuário → 401.
3. Já tem atribuição? (UNIQUE em `user_id`) → `ok:true, already:true`, não mexe.
4. Resolve o `link` pelo `hmn_ref` → pega `ambassador_id`.
5. **Guard anti auto-promoção:** se `ambassador.user_id === user.id`, ignora.
6. Insere `attributions` (`user_id`, `ambassador_id`, `link_id`). Idempotente.

Trigger no client: o onboarding chama `POST /api/ambassador/attach` uma vez ao
montar (mesmo padrão do referral). Chamar de novo é inofensivo (idempotente).

### Peça 3 — crédito no pagamento (webhook)
Edita `src/app/api/webhook/stripe/route.ts`. Após o `upgradeUser` nos casos
`checkout.session.completed` **e** `invoice.payment_succeeded`, chama
`creditAmbassador(uid, { invoiceId, grossCents, currency, eventType })`:
1. Consulta `attributions` do `uid` (client admin). Sem atribuição → retorna (orgânico).
2. **Guard:** se `ambassador.user_id === uid` → pula (não ganha do próprio pagamento).
3. Insere `conversions` (`ambassador_id`, `user_id`, `stripe_invoice_id`,
   `gross_amount_cents`, `currency`, `stripe_event_type`, status `pending`).
4. `UNIQUE(stripe_invoice_id)` faz a inserção ser **idempotente**: se a mesma fatura
   chegar por dois eventos (o 1º pagamento dispara `checkout.session.completed` e
   `invoice.payment_succeeded` para a mesma invoice) ou por retry do Stripe, a 2ª
   inserção é no-op (conflito ignorado). Recorrência: cada renovação é uma invoice
   nova → uma conversão nova → comissão recorrente.

Origem dos dados por evento:
- `checkout.session.completed`: `session.invoice` (id), `session.amount_total`, `session.currency`.
- `invoice.payment_succeeded`: `invoice.id`, `invoice.amount_paid`, `invoice.currency`.

### Helpers
`src/lib/ambassadors/` — `hashIp(ip)` (SHA-256 + salt de env) e `creditAmbassador(...)`.

## 5. Como testar (ponta a ponta)
1. Aplicar `009_ambassadors.sql` → cria as tabelas + seed: embaixador "Teste" +
   link `slug='teste'`.
2. Abrir `/e/teste` → deve **302 → `/`**; conferir 1 linha em `link_clicks` e o
   cookie `hmn_ref` setado.
3. Cadastrar um **usuário novo** → após o onboarding, conferir 1 linha em
   `attributions` ligando esse usuário ao "Teste".
4. Assinar em **Stripe test mode** → conferir 1 linha em `conversions` creditando
   o "Teste", `status='pending'`, `gross_amount_cents` correto.
5. Reenviar o mesmo evento de webhook (Stripe CLI `resend`) → **não duplica**
   a conversão (idempotência por `stripe_invoice_id`).

Queries de conferência acompanham o plano de implementação.

## 6. Arquivos
| Ação | Arquivo |
|---|---|
| novo | `supabase/migrations/009_ambassadors.sql` (5 tabelas + RLS + seed de teste) |
| novo | `src/app/e/[slug]/route.ts` (rota do link + clique + cookie) |
| novo | `src/app/api/ambassador/attach/route.ts` (captura first-touch) |
| novo | `src/lib/ambassadors/index.ts` (hashIp + creditAmbassador) |
| edita | `src/app/api/webhook/stripe/route.ts` (chama creditAmbassador em 2 handlers) |
| edita | `src/app/onboarding/…` (dispara o attach 1x ao montar) |

## 7. Riscos & pontos de atenção
- **Webhook Stripe é o ponto delicado** — testar retry/idempotência de verdade com
  o Stripe CLI. A idempotência por `stripe_invoice_id` é a rede de segurança.
- **Onboarding como ponto de captura** depende do gate de onboarding (já existe no
  middleware) garantir que todo usuário novo passe por lá antes de pagar. Como o
  attach é idempotente, dá pra reforçar chamando também de um layout autenticado se
  necessário — mas começamos só pelo onboarding (YAGNI).
- **LGPD:** `link_clicks` guarda **IP hasheado**, nunca cru.
