# Programa de Embaixadores Humanáh — arquitetura & plano

> **Status:** 📐 planejamento (nada implementado). Referência para construir depois.
> Branch sugerida quando começar: `feature/embaixadores` a partir da `homolog`.

## Visão em 1 frase
Landing própria → a pessoa se **inscreve** → você **aprova** (curadoria) → ela recebe
um **link personalizado** + acesso a um **portal com login** (métricas ao vivo,
ganhos, kit de divulgação) → divulga e ganha uma **comissão que sobe por nível**.

## Decisões travadas
1. **Remuneração gamificada** — a % sobe conforme a quantidade de pagantes indicados.
2. **Curadoria manual** — o formulário é avaliado (nº de seguidores + testemunho de fé)
   antes de aprovar. Não é auto-aprovação.
3. **Portal com login próprio** para o embaixador.

---

## 1. Duas landings distintas (não misturar)
| Funil | Público | Página | CTA |
|---|---|---|---|
| Usuário (existe) | quem quer o devocional | `humanah.app/` | "Receber meu devocional" |
| **Embaixador** (novo) | quem vai divulgar | `humanah.app/embaixadores` | "Quero ser embaixador" |

## 2. Remuneração gamificada (níveis)
A % é **recorrente** (ganha enquanto o indicado paga) e **sobe por nível**. Exemplo
(valores 100% ajustáveis):

| Nível | Pagantes conquistados | Comissão recorrente |
|---|---|---|
| 🥉 Bronze | 1–100 | 5% |
| 🥈 Prata | 101–200 | 10% |
| 🥇 Ouro | 201–500 | 15% |
| 💎 Diamante | 501–1000 | 20% |
| 🍯 **Maná** *(topo)* | 1001+ | **30%** |

> O 5º nível — **Maná** 🍯 (pote de mel) — é o topo aspiracional: transcende a
> escada de metais/pedras para a alma da marca (o maná tinha gosto de mel, Êx 16:31).

- **Nível por total conquistado (lifetime)** → nunca rebaixa; motiva mais (recomendado).
  *(Alternativa: por pagantes ATIVOS agora — premia retenção, mas pode "cair de nível".)*
- A comissão **confirma** após a janela de reembolso (7 dias CDC) e enquanto a
  assinatura estiver ativa.
- Combina com a identidade: os níveis podem ser tematizados ("mel"/colheita).
- **Tom cristão:** oferecer opção de **doar a comissão** ou revertê-la em premium
  para a congregação — respeita quem se incomoda com "ganhar divulgando a Palavra".

## 3. Inscrição + curadoria manual
**Formulário** (`/embaixadores` → aplicar) coleta o que você precisa pra avaliar:
- Nome, e-mail, WhatsApp, chave **Pix**.
- Redes + **nº de seguidores** (Instagram/YouTube/TikTok) + link do canal principal.
- **Testemunho**: "conte sua caminhada com Cristo" (avaliar fé/visão da Palavra).
- Igreja/ministério, e como pretende divulgar.

**Fluxo:** aplica → `status: pending` → você revisa no admin → **aprova/recusa**.
Ao aprovar: cria a conta do embaixador (convite/magic link p/ definir senha) +
gera o **slug** (`humanah.app/e/<slug>`) + libera o portal.

## 4. Portal do embaixador (login próprio)
Supabase Auth com `role='ambassador'`, em `humanah.app/embaixador`:
- **Seu link** (copiar + **QR code** + textos prontos).
- **Métricas ao vivo**: cliques → cadastros → pagantes → **R$ ganho**.
- **Nível atual** + barra "faltam X pagantes pro próximo nível" (gamificação).
- **Ganhos & saque** (Pix): acumulado, liberado, status.
- **Kit de divulgação** (item 6).

## 5. Motor de atribuição (link → receita) — o coração
```
humanah.app/e/pastorjoao
     │  rota /e/[slug] (server): registra clique + cookie hmn_ref (90 dias) → 302 → /
     ▼
usuário se cadastra → lê cookie → cria `attributions` (first-touch)
     ▼
usuário assina → webhook Stripe → credita a receita ao embaixador (conversions)
```
First-touch (quem trouxe primeiro leva). Reaproveita a ideia do link curto `/s`.

## 6. Kit de divulgação ("já sai divulgando")
Cards prontos (stories/feed) já com o link/QR dele + legendas sugeridas + mini
media-kit. Reaproveita o `ShareModal`/Canvas que já existe.

## 7. Painel admin (supervisão)
Lista de embaixadores, **fila de aprovação**, ajustar nível/comissão manual,
métricas por embaixador, **processar saques (Pix)**, flags de fraude, e a visão
geral do negócio (MRR, funil, receita por embaixador).

## 8. Modelo de dados (novas tabelas)
| Tabela | Guarda |
|---|---|
| `ambassadors` | perfil, status (pending/active/suspended), user_id (login), Pix, respostas do form, nível |
| `ambassador_links` | slug, destino, UTM, ativo |
| `link_clicks` | clique: link_id, ts, IP hasheado, país, device, referrer |
| `attributions` | user_id → ambassador_link_id, first_touch_at |
| `conversions` (view) | receita atribuída por embaixador (join profiles + Stripe + attribution) |
| `ambassador_payouts` | período, valor, status (pendente/pago), data |

## 9. Antifraude
- **Auto-indicação** (assinar pelo próprio link) → bloquear.
- Comissão só em **pagante** e **após reembolso**.
- **Cookie stuffing** → dedupe por IP hasheado/device.
- First-touch resolve disputa de crédito.

## 10. Exportação visual
- **PDF branded** por embaixador (`@react-pdf/renderer`) — relatório formal.
- **Portal read-only ao vivo** (o próprio login do embaixador já serve).
- **CSV** pro admin. **⚠️ LGPD:** só números agregados — nunca a lista de usuários.

## 11. Fases de implementação
1. ✅ Modelo de dados + motor de atribuição (`/e/<slug>` + cookie + cadastro + Stripe).
2. ✅ Landing `/embaixadores` + formulário de inscrição.
3. ✅ Admin: fila de aprovação + criação de conta ao aprovar.
4. ✅ Portal do embaixador (login + link + métricas + níveis).
5. ✅ Comissão gamificada (cálculo de nível + ganhos) + saque (Pix).
6. ✅ Kit de divulgação + exportação (PDF).
7. **Painel de observabilidade** (a seção 7 deste doc): visão geral do negócio e
   métricas por embaixador. *Estava descrito como funcionalidade mas faltava na
   lista de fases, e por isso escorregou duas vezes.*
8. Antifraude + polimento. *Auto-indicação, comissão só em pagante e após
   reembolso, e first-touch já foram implementados nas fases 1, 3 e 5; resta o
   dedupe de cookie stuffing por IP e device.*

## 12. ⏱️ Tempo e custo (vibe coding)
Estimativa em **esforço** (sessões focadas com IA) — vibe coding é bem mais rápido
que dev tradicional, mas ainda exige teste/iteração (o Stripe é o ponto delicado):

| Módulo | Esforço (vibe) |
|---|---|
| Modelo de dados + migrations (RLS) | 0.5 dia |
| **Motor de atribuição** (link→cookie→cadastro→Stripe) | 1–1.5 dia |
| Landing `/embaixadores` + formulário | 1 dia |
| Curadoria (admin aprova) + criação de conta | 1 dia |
| Portal do embaixador (login + link + métricas + níveis) | 1.5 dia |
| Comissão gamificada (níveis + ganhos) | 0.5 dia |
| Painel admin (lista, aprovar, ajustar, saques) | 1.5 dia |
| Kit de divulgação (cards + legendas) | 0.5 dia |
| Antifraude | 0.5 dia |
| Exportação (PDF) | 0.5 dia |
| QA + integração + polimento | 1 dia |
| **Total** | **~10–11 dias de esforço** |

**Tempo de calendário (realista):**
- **MVP** (landing + inscrição + aprovação + link + atribuição + portal básico):
  **~1 semana** dedicado · ~2–3 semanas em ritmo noturno/fim de semana.
- **Completo** (níveis + ganhos + saque + kit + admin + export + antifraude):
  **~2–3 semanas** dedicado · ~4–6 semanas em ritmo noturno.

**Custo em dinheiro:**
- **Marginal ≈ R$ 0** — usa o que você já tem (Supabase, Vercel, Stripe). Sem infra nova.
- Bibliotecas (react-pdf, QR) são gratuitas.
- Único custo real recorrente = **as comissões pagas** — mas saem da **receita que os
  embaixadores geram** (ROI positivo por definição).
- *(Se um dia quiser BI no braço: Metabase self-host ~ custo de um servidor pequeno.)*

> Estimativas de vibe coding variam com a iteração — o **motor de atribuição + Stripe**
> é o que mais pede teste real (eventos de webhook), então reserve folga ali.

## 13. Segurança / LGPD
- Portal e admin com role (`ambassador` / `admin`) + RLS; service_role só no servidor.
- Chave Pix e dados do embaixador = PII → tratar conforme LGPD.
- Relatórios/portal do embaixador = **agregados**, sem PII de usuários.
- `link_clicks` com **IP hasheado**.
