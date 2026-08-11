# Embaixadores — Fatia 2: Landing + Inscrição — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (execução inline nesta sessão). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Landing pública `/embaixadores` que vende o programa (persuasão sóbria na identidade da marca) e grava inscrições em `ambassadors` (`status='pending'`).

**Architecture:** Página server component (`metadata`) + client (`EmbaixadoresClient` com framer-motion, padrão da landing atual). Lógica de níveis em `src/lib/ambassadors/levels.ts` (fonte única, reutilizável pelo portal). Rota `POST /api/ambassador/apply` fina sobre validação pura + insert service_role.

**Tech Stack:** Next.js 16 App Router, framer-motion, Tailwind v4 + tokens do design system, Supabase service_role, Vitest.

## Global Constraints
- Spec: `docs/superpowers/specs/2026-08-10-embaixadores-landing-design.md`.
- Sem trailer `Co-Authored-By`. Sem emoji na UI (medalhões SVG). Sem prova social falsa.
- Preço vem de `PREMIUM_PRICE` (`src/lib/constants.ts` = 24.9) — nunca hardcoded na lógica.
- Níveis: Bronze 1–100 5% · Prata 101–200 10% · Ouro 201–500 15% · Diamante 501–1000 20% · Maná 1001+ 30%.
- Testes seguem padrão `src/__tests__/` + `vi.hoisted`; rodar com `npm test -- <arquivo>`.

---

### Task 1: Migration 010 — colunas do formulário + índice único de e-mail
**Files:** Create `supabase/migrations/010_ambassador_application.sql`
Colunas novas em `ambassadors`: `social_platform text`, `social_handle text`, `followers_count integer`, `church text`, `testimony text`, `promotion_plan text`; índice único `ambassadors_email_unique_idx` em `lower(email)` (where email is not null). Commit.

### Task 2: `levels.ts` — fonte única dos níveis (TDD)
**Files:** Create `src/lib/ambassadors/levels.ts`, test `src/__tests__/unit/ambassadors-levels.test.ts`
**Produces:** `LEVELS: AmbassadorLevel[]` (`{ name, slug, min, max, rate }`), `getLevel(count): AmbassadorLevel | null` (null p/ count ≤ 0), `estimateMonthly(count, price?): number`. Testes de fronteira (1, 100, 101, 200, 201, 500, 501, 1000, 1001) + estimativa (300 → nível ouro → 300×24.9×0.15) + count 0 → null/0. Exportar no barrel. Commit.

### Task 3: `POST /api/ambassador/apply` (TDD)
**Files:** Create `src/app/api/ambassador/apply/route.ts`, `src/lib/ambassadors/apply.ts` (validação pura `validateApplication(body)` → `{ ok, errors? , data? }`), test `src/__tests__/api/ambassador-apply.test.ts`
Regras: nome ≥2 · e-mail com regex simples · whatsapp ≥10 dígitos · platform ∈ {instagram, youtube, tiktok, outro} · handle ≥2 · followers ≥0 int · testimony ≥20. Honeypot `website` preenchido → `{ ok: true }` sem insert. Insert `status='pending'`; erro `23505` → `{ ok: true, already: true }`. Testes: 422 inválido, honeypot não insere, feliz insere payload certo, duplicado → 200. Commit.

### Task 4: UI da landing (frontend-design)
**Files:** Create `src/app/embaixadores/page.tsx` (server, metadata), `src/app/embaixadores/EmbaixadoresClient.tsx` (9 blocos), `src/app/embaixadores/Calculadora.tsx`, `src/app/embaixadores/ApplyForm.tsx`, `src/app/embaixadores/medallions.tsx` (SVGs dos níveis).
Blocos e copy conforme spec §3. Calculadora usa `getLevel`/`estimateMonthly`. Form → `fetch POST /api/ambassador/apply` com estados loading/sucesso/erro. Invocar skill `frontend-design` antes de codar. Commit.

### Task 5: Verificação final
`npm run lint` (sem erros novos) + suíte de embaixadores completa verde + conferência visual (`npm run dev` → usuário). Commit final se houver ajustes.
