# Embaixadores — Fatia 3: Curadoria — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (execução inline). Steps usam checkbox (`- [ ]`).

**Goal:** Tela de curadoria onde o dono aprova ou recusa inscrições; aprovar gera o link `/e/<slug>` e dispara e-mail automático.

**Architecture:** Lógica pura e testável em `src/lib` (auth do admin, slug, templates de e-mail); rotas finas por cima; UI server component com portão de cookie. Envio de e-mail isolado atrás de uma função que degrada com elegância quando o SMTP não está configurado.

**Tech Stack:** Next.js 16 App Router, nodemailer (Zoho SMTP), Supabase service_role, Vitest.

## Global Constraints
- Spec: `docs/superpowers/specs/2026-08-12-embaixadores-curadoria-design.md`.
- Sem trailer `Co-Authored-By`. **Sem travessão em texto visível** (regra de copy da marca).
- Segredo nunca vai para o cookie: guarda-se token derivado. Comparação timing-safe.
- Rotas de API validam o cookie por conta própria (UI não é fronteira de segurança).
- `ADMIN_SECRET` ausente → nega acesso, nunca libera.
- Falha de e-mail não desfaz aprovação.
- Testes em `src/__tests__/`, mocks com `vi.hoisted`, rodar `npm test -- <arquivo>`.

---

### Task 1: Migration 011 (status rejected + reviewed_at)
Create `supabase/migrations/011_ambassador_review.sql`: recriar o CHECK de `status` incluindo `'rejected'`; `add column if not exists reviewed_at timestamptz`. Commit.

### Task 2: `src/lib/admin/auth.ts` (TDD)
**Produces:** `deriveAdminToken(secret: string): string` (HMAC-SHA256 hex), `verifyAdminSecret(input: string): boolean` (timing-safe contra `process.env.ADMIN_SECRET`), `isAdminAuthed(cookieValue?: string | null): boolean`.
Testes: senha correta passa; senha errada falha; `ADMIN_SECRET` ausente sempre falha (fail-closed); cookie válido autentica; cookie adulterado falha; comprimentos diferentes não lançam exceção (timingSafeEqual exige buffers do mesmo tamanho). Test `src/__tests__/unit/admin-auth.test.ts`. Commit.

### Task 3: `POST/DELETE /api/admin/session` (TDD)
`POST` recebe `{ secret }` → válido seta cookie `hmn_admin` (httpOnly, secure, sameSite lax, 12h) e retorna `{ ok: true }`; inválido → 401. `DELETE` limpa o cookie. Test `src/__tests__/api/admin-session.test.ts`. Commit.

### Task 4: `src/lib/ambassadors/slug.ts` (TDD)
`slugify(name)`: minúsculas, remove acentos, mantém `[a-z0-9]`, corta em 24 chars. `uniqueSlug(admin, base)`: consulta `ambassador_links`, se ocupado tenta `base2`, `base3`... Testes: acentos e espaços; nome vazio vira fallback; colisão gera sufixo. Test `src/__tests__/unit/ambassadors-slug.test.ts`. Commit.

### Task 5: e-mail (TDD nos templates)
`npm install nodemailer` + `@types/nodemailer` (dev).
`src/lib/email/templates.ts`: `approvalEmail({ name, link })` e `rejectionEmail({ name })` → `{ subject, text, html }`, sem travessão.
`src/lib/email/mailer.ts`: `sendMail({to, subject, text, html}): Promise<boolean>` — sem env de SMTP retorna `false` sem lançar; erro de envio retorna `false` e loga.
Testes dos templates: contêm o nome, o link aparece no de aprovação, nenhum travessão. Test `src/__tests__/unit/email-templates.test.ts`. Commit.

### Task 6: `POST /api/admin/ambassadors/review` (TDD)
Body `{ id, action: 'approve'|'reject', slug? }`. Sem cookie válido → 401. `approve`: gera/valida slug único, `update ambassadors set status='active', reviewed_at=now()`, insert em `ambassador_links`, dispara e-mail, retorna `{ ok, slug, link, emailSent }`. `reject`: `status='rejected'`, `reviewed_at`, e-mail de recusa, `{ ok, emailSent }`. Erro de e-mail não derruba a operação. Test `src/__tests__/api/admin-review.test.ts`. Commit.

### Task 7: UI do admin
`src/app/admin/layout.tsx` (portão), `src/app/admin/login/page.tsx` + `LoginClient.tsx`, `src/app/admin/embaixadores/page.tsx` (server, lista pending) + `FilaClient.tsx` (cards com testemunho, @ clicável, seguidores; aprovar com slug editável; recusar; feedback de `emailSent` com mensagem copiável). Adicionar `/admin` ao `isWebRoute` do `ClientLayout` e ao `disallow` do `robots.ts`. Commit.

### Task 8: Verificação
`npx tsc --noEmit`, `npm run lint`, `npm run build`, suíte de embaixadores + admin verde. Commit se houver ajuste.
