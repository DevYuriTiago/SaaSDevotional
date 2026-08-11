# Fatia 2 — Landing `/embaixadores` + formulário de inscrição (design)

> Programa de Embaixadores Humanáh — segunda fatia. Contexto: [`docs/embaixadores.md`](../../embaixadores.md).
> Fatia 1 (motor de atribuição) já validada E2E. Branch: `feature/embaixadores`. Data: 2026-08-10.

## 1. Objetivo
Página pública de captação de embaixadores: vende o programa com persuasão sóbria
(na identidade "A Vigília → A Alvorada") e converte em **inscrição** gravada em
`ambassadors` com `status='pending'` (curadoria manual decide depois — Fatia 3).

### Fora de escopo
Curadoria/admin (aprovar/recusar), criação de login do embaixador, portal, e-mails
transacionais, cálculo real de saldo.

## 2. Decisões travadas
- **Identidade:** mesma da landing atual — noite + ouro protagonista, Fraunces,
  `aurora-bg`/`btn-primary`/`eyebrow`/`card-base`/`input-base`. **Sem emoji** (regra
  do design system): níveis viram **medalhões desenhados** (SVG autoral).
- **Sem prova social falsa.** Nenhum número inventado, nenhum depoimento fabricado.
  Persuasão vem de: missão, recorrência, progressão (níveis), número concreto
  (calculadora com preço real R$ 24,90) e exclusividade (curadoria manual — real).
- **Pix NÃO é coletado no formulário** — só na aprovação (menos atrito, menos PII).
  (Ajuste consciente sobre o doc original, aprovado pelo usuário.)
- **Calculadora interativa** (slider de assinantes ativos → R$/mês + nível), com
  nota honesta: estimativa no plano mensal; comissão confirma após 7 dias e vale
  enquanto a assinatura estiver ativa.
- **Anti-spam sem atrito:** honeypot (campo oculto); se preenchido → resposta de
  sucesso falsa sem gravar. Duplicata de e-mail → sucesso idempotente (não vaza
  quem já se inscreveu).

## 3. Arquitetura de persuasão (9 blocos)
1. **Hero** — "Você já leva a Palavra. Agora ela sustenta o seu chamado." CTA
   `Quero ser embaixador` (âncora #inscricao) + ghost `Ver como funciona`.
2. **Reenquadramento** (objeção cristã nº1) — "Ministério que sustenta ministério."
   + opção de doar a comissão.
3. **Como funciona** — 3 passos; destaque à **recorrência** ("todo mês, enquanto
   permanecerem").
4. **A jornada dos níveis** — medalhões Bronze→Prata→Ouro→Diamante→**Maná** (pote
   de mel em traço dourado, destaque). Tabela: 1–100 5% · 101–200 10% · 201–500
   15% · 501–1000 20% · 1001+ **30%**.
5. **Calculadora** — slider 0–2000; mostra nível atual + % + **R$/mês estimado**
   (count × 24,90 × taxa). Nota de honestidade.
6. **"Não é para todos"** — curadoria manual real (coerência de fé + alcance),
   análise uma a uma, retorno em até 7 dias. Sem escassez inventada.
7. **FAQ (5)** — custa algo? · quando recebo? (Pix mensal, após garantia de 7
   dias) · quantos seguidores preciso? · posso doar a comissão? · como acompanho?
   (portal com métricas — em breve no fluxo de aprovação).
8. **Formulário** (#inscricao) → `POST /api/ambassador/apply` → `pending`.
   Campos: nome*, e-mail*, WhatsApp*, plataforma principal* (Instagram/YouTube/
   TikTok/Outro), @usuário*, nº de seguidores*, igreja/ministério (opcional),
   testemunho* (caminhada com Cristo), como pretende divulgar (opcional) +
   honeypot oculto. Sucesso: card "Recebemos sua inscrição — análise manual em
   até 7 dias, retorno no seu e-mail."
9. **Fecho** — CTA final + rodapé mínimo (link pra home).

## 4. Técnica
- **Rota pública** `/embaixadores` (fora dos protectedRoutes do middleware — ok).
- `src/app/embaixadores/page.tsx` = server component (exporta `metadata` SEO) que
  renderiza `EmbaixadoresClient.tsx` (client, framer-motion, mesmo padrão da
  landing). Form e calculadora como componentes co-locados.
- **Migration `010_ambassador_application.sql`:** adiciona a `ambassadors` as
  colunas do formulário — `social_platform`, `social_handle`, `followers_count`
  (integer), `church`, `testimony`, `promotion_plan` — e índice único
  `lower(email)` (idempotência de inscrição).
- **`src/lib/ambassadors/levels.ts`** — fonte única dos níveis (nome, faixa,
  taxa), `getLevel(count)` e `estimateMonthly(count)`; reutilizada pela
  calculadora e, depois, pelo portal/comissão. Com testes de fronteira.
- **`POST /api/ambassador/apply`** — validação (nome ≥2, e-mail válido, WhatsApp
  ≥10 dígitos, plataforma na lista, handle, followers ≥0, testemunho ≥20 chars),
  honeypot, insert `status='pending'` via service_role, `23505` → sucesso
  idempotente. Com testes.
