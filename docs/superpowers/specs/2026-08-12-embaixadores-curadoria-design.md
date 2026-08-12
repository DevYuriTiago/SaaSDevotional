# Fatia 3 — Curadoria de embaixadores (design)

> Programa de Embaixadores Humanáh, terceira fatia. Contexto: [`docs/embaixadores.md`](../../embaixadores.md).
> Fatias 1 (motor de atribuição) e 2 (landing + inscrição) já na `homolog`.
> Branch: `feature/embaixadores`. Data: 2026-08-12.

## 1. Objetivo
Fechar o ciclo do funil: hoje as inscrições entram como `pending` e não existe
forma de aprová-las. Esta fatia entrega a **tela de curadoria** onde o dono do
negócio lê cada inscrição, **aprova** (gerando o link `/e/<slug>` que o motor da
Fatia 1 já sabe creditar) ou **recusa**, com aviso automático por e-mail.

### Fora de escopo (Fatia 4+)
Login e portal do embaixador, métricas ao vivo, cálculo de comissão, fila de
saque, kit de divulgação.

## 2. Decisões travadas
- **Acesso por senha única (`ADMIN_SECRET`)**, escolha do usuário, seguindo o
  padrão do `grant-premium` existente. Implementação endurecida:
  - comparação em **tempo constante** (`crypto.timingSafeEqual`) contra ataque de timing;
  - o cookie guarda um **token derivado** (HMAC do segredo), nunca o segredo cru;
  - cookie `httpOnly`, `secure`, `sameSite=lax`.
- **Portão no `layout.tsx` do `/admin`** (server component, runtime Node), não no
  middleware: middleware roda em Edge Runtime, que não tem `node:crypto`.
  **As rotas de API validam o cookie por conta própria** — a UI não é a
  fronteira de segurança, a API é.
- **E-mail por SMTP do Zoho** (`nodemailer`, remetente `contato@humanah.app`).
  Sem vendor novo e o domínio já tem SPF/DKIM no Zoho. Limite diário de caixa
  postal é irrelevante no volume de curadoria manual; se um dia escalar, o
  caminho é ZeptoMail (mesma conta Zoho).
- **Falha de e-mail não desfaz a aprovação.** O embaixador fica ativo e a tela
  informa que o aviso não saiu, oferecendo a mensagem para envio manual por
  WhatsApp. Indisponibilidade de e-mail não pode travar o negócio.
- **Slug sugerido a partir do nome, editável e único.** `Pastor João` →
  `pastorjoao`. Colisão resolve com sufixo numérico.

## 3. Fluxo
```
inscrição (Fatia 2) → status 'pending'
        ↓
/admin/login  → senha → cookie derivado
        ↓
/admin/embaixadores  → fila com testemunho, @ clicável, seguidores
        ↓
   aprovar                              recusar
        ↓                                  ↓
 slug único + ambassador_links       status 'rejected'
 status 'active' + reviewed_at       + reviewed_at
        ↓                                  ↓
 e-mail de boas-vindas c/ link      e-mail breve e gentil
        ↓
 /e/<slug> já credita (motor da Fatia 1)
```

## 4. Modelo de dados
Migration `011_ambassador_review.sql`:
- `status` ganha `'rejected'` no CHECK (hoje só `pending|active|suspended`);
- `reviewed_at timestamptz` — histórico de quando a decisão foi tomada.

## 5. Componentes
| Arquivo | Responsabilidade |
|---|---|
| `src/lib/admin/auth.ts` | `deriveAdminToken()`, `verifyAdminSecret()` (timing-safe), `isAdminAuthed()` |
| `src/app/api/admin/session/route.ts` | `POST` login (seta cookie), `DELETE` logout |
| `src/app/admin/layout.tsx` | portão: sem cookie válido → tela de login |
| `src/app/admin/login/page.tsx` | formulário de senha |
| `src/app/admin/embaixadores/page.tsx` | fila (server, service_role) |
| `src/app/admin/embaixadores/FilaClient.tsx` | cards, aprovar/recusar, edição de slug |
| `src/lib/ambassadors/slug.ts` | `slugify()` + `uniqueSlug()` |
| `src/lib/email/mailer.ts` | transporte SMTP Zoho (nodemailer) |
| `src/lib/email/templates.ts` | textos de aprovação e recusa (funções puras) |
| `src/app/api/admin/ambassadors/review/route.ts` | `POST` aprovar/recusar |

## 6. Variáveis de ambiente novas
`ADMIN_SECRET`, `ZOHO_SMTP_USER`, `ZOHO_SMTP_PASSWORD` (senha de aplicativo),
`ZOHO_SMTP_HOST` (padrão `smtp.zoho.com`), `ZOHO_SMTP_PORT` (padrão `465`).
Sem as variáveis de SMTP o app continua funcionando: o envio é pulado e a
resposta avisa `emailSent: false`.

## 7. Segurança
- Rotas de admin exigem o cookie; a UI não é a fronteira.
- `ADMIN_SECRET` ausente → todas as rotas de admin negam acesso (nunca liberam).
- Nenhum dado de embaixador é exposto fora do `/admin` (service_role só no servidor).
- `/admin` fora do sitemap e bloqueado no `robots.txt`.
