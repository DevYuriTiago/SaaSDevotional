# Embaixadores — Fatia 4: Portal do embaixador — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (execução inline). Steps usam checkbox (`- [ ]`).

**Goal:** Tela `/embaixador` com link, QR, funil de resultados, ganhos em reais e nível.

**Architecture:** View no banco agrega os números; `earnings.ts` deriva nível e comissão a partir de `levels.ts` (fonte única); `portal.ts` resolve qual embaixador pertence ao usuário logado, exigindo e-mail confirmado. Página server component monta tudo.

**Tech Stack:** Next.js 16 App Router, Supabase service_role, qrcode, Vitest.

## Global Constraints
- Spec: `docs/superpowers/specs/2026-08-15-embaixadores-portal-design.md`.
- Sem trailer `Co-Authored-By`. **Sem travessão em texto visível.**
- Vínculo só com `email_confirmed_at` presente. Vínculo existente nunca é reatribuído.
- Ganhos separam `confirmed` (disponível) de `pending` (a liberar).
- Regra de nível e taxa só em `levels.ts`.
- Testes em `src/__tests__/`, mocks com `vi.hoisted`. Rodar com `npx vitest run --no-file-parallelism <arquivo>` (a execução paralela satura esta máquina).

---

### Task 1: Migration 012 (view de estatísticas)
Create `supabase/migrations/012_ambassador_stats.sql`: view `ambassador_stats` agregando por embaixador cliques, cadastros, pagantes distintos, bruto pendente e bruto confirmado. Usar subconsultas para evitar multiplicação de linhas por join. Commit.

### Task 2: `src/lib/ambassadors/earnings.ts` (TDD)
**Produces:**
- `type AmbassadorStats = { clicks, signups, payingCount, grossPendingCents, grossConfirmedCents }`
- `type Earnings = { level, nextLevel, payingToNextLevel, progressPct, availableCents, pendingCents, rate }`
- `computeEarnings(stats): Earnings` — usa `getLevel` de `levels.ts`; comissão = bruto × taxa do nível; `nextLevel` nulo no topo; `progressPct` entre 0 e 100.
Testes: zero pagantes (nível nulo, ganhos zero); dentro do Bronze; fronteira exata de mudança de nível; topo (Maná sem próximo, progresso 100); comissão calculada com a taxa certa; pendente e confirmado separados. Test `src/__tests__/unit/ambassadors-earnings.test.ts`. Commit.

### Task 3: `src/lib/ambassadors/portal.ts` (TDD)
**Produces:** `resolveAmbassador(admin, user): Promise<{ id, name, slug } | null>`
Regras: já vinculado por `user_id` → devolve direto; senão, procura `ambassadors` com `status='active'` e mesmo e-mail (case-insensitive) **e** `user.email_confirmed_at` presente → grava `user_id` e devolve; sem e-mail confirmado → null; sem inscrição ativa → null; inscrição de outra pessoa já vinculada a outro usuário → null.
Testes cobrindo cada regra. Test `src/__tests__/unit/ambassadors-portal.test.ts`. Commit.

### Task 4: página `/embaixador`
`npm install qrcode` + `@types/qrcode` (dev).
`src/app/embaixador/page.tsx` (server): resolve embaixador, lê `ambassador_stats`, gera QR (`QRCode.toString` SVG), renderiza `PortalClient`. Sem embaixador → estado de convite.
`src/app/embaixador/PortalClient.tsx`: cabeçalho com medalhão, link com copiar, QR, funil com taxas, ganhos, barra de progresso. Reusa `Medallion` de `/embaixadores`.
Middleware: `/embaixador` em `protectedRoutes`. `robots.ts`: `disallow` de `/embaixador`. Commit.

### Task 5: Verificação
`npm run build`, lint, e suíte sequencial verde (só as 4 falhas pré-existentes). Commit se houver ajuste.
