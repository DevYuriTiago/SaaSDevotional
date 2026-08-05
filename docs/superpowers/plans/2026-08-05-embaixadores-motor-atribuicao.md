# Embaixadores — Fatia 1: Motor de Atribuição — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir o encanamento invisível que liga clique num link de embaixador → cadastro → pagamento → crédito ao embaixador, testável ponta a ponta com 1 embaixador criado à mão.

**Architecture:** Lógica de negócio em funções puras (`src/lib/ambassadors/`) testadas com admin client mockado; rotas finas (`/e/[slug]`, `/api/ambassador/attach`) e o webhook Stripe existente apenas orquestram. Fonte única de verdade = tabela `attributions` (abordagem A); crédito idempotente por `UNIQUE(stripe_invoice_id)`.

**Tech Stack:** Next.js 16 (App Router, Route Handlers), TypeScript, Supabase (Postgres + RLS, `@supabase/supabase-js` service_role e `@supabase/ssr`), Stripe webhooks, Vitest (jsdom) + `vi.hoisted`/`vi.mock`.

## Global Constraints

- **Spec de referência:** `docs/superpowers/specs/2026-08-05-embaixadores-motor-atribuicao-design.md`. Contexto do programa: `docs/embaixadores.md`.
- **Sem commit trailer** `Co-Authored-By` (regra do projeto).
- **RLS negado por padrão** nas 5 tabelas novas: `enable row level security` sem policy permissiva → só `service_role`.
- **First-touch:** `UNIQUE(user_id)` em `attributions` — nunca sobrescreve.
- **Idempotência:** `UNIQUE(stripe_invoice_id)` em `conversions`; código trata `error.code === "23505"` como no-op.
- **LGPD:** `link_clicks` guarda **IP hasheado** (SHA-256 + salt), nunca IP cru.
- **Fatia 1 não calcula comissão** — guarda `gross_amount_cents`. Nível/% e saque são fatias futuras.
- **Convenções de migration:** `uuid` PK `default gen_random_uuid()`, `timestamptz ... default now()`, igual a `001_initial.sql`.
- **Convenções de teste:** arquivos em `src/__tests__/`, primeira linha `// PATH: <caminho>`, mocks via `vi.hoisted`, rota importada **depois** dos `vi.mock`.
- **Rodar testes:** `npm test -- <arquivo>` (vitest run). Lint: `npm run lint`.

---

### Task 1: Migration — schema das 5 tabelas + RLS

**Files:**
- Create: `supabase/migrations/009_ambassadors.sql`

**Interfaces:**
- Consumes: nada.
- Produces: tabelas `ambassadors`, `ambassador_links`, `link_clicks`, `attributions`, `conversions` (colunas conforme o spec §3). Consumidas pelas Tasks 3–7.

> Nota de decisão (melhoria sobre o spec): o **seed do embaixador de teste NÃO vai na migration** (evita poluir produção com um "Teste"). O seed é um snippet manual no passo de teste da Task 8.

- [ ] **Step 1: Criar a migration**

Create `supabase/migrations/009_ambassadors.sql`:

```sql
-- =============================================
-- Programa de Embaixadores — Fatia 1: motor de atribuição
-- 5 tabelas + RLS negado por padrão (só service_role no servidor).
-- Contexto: docs/superpowers/specs/2026-08-05-embaixadores-motor-atribuicao-design.md
-- =============================================

-- 1) EMBAIXADOR
create table if not exists public.ambassadors (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users on delete set null, -- nulo até ter login (fatia futura)
  name       text not null,
  email      text,
  whatsapp   text,
  pix_key    text,
  status     text not null default 'active' check (status in ('pending','active','suspended')),
  created_at timestamptz not null default now()
);

-- 2) LINK COMPARTILHÁVEL (1 embaixador pode ter vários)
create table if not exists public.ambassador_links (
  id            uuid default gen_random_uuid() primary key,
  ambassador_id uuid references public.ambassadors on delete cascade not null,
  slug          text not null unique,
  destination   text not null default '/',
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);
create index if not exists ambassador_links_ambassador_idx on public.ambassador_links (ambassador_id);

-- 3) LOG DE CLIQUES (IP hasheado — LGPD)
create table if not exists public.link_clicks (
  id         uuid default gen_random_uuid() primary key,
  link_id    uuid references public.ambassador_links on delete cascade not null,
  clicked_at timestamptz not null default now(),
  ip_hash    text,
  country    text,
  device     text,
  referrer   text
);
create index if not exists link_clicks_link_idx on public.link_clicks (link_id);

-- 4) ATRIBUIÇÃO usuário → embaixador (FIRST-TOUCH via UNIQUE(user_id))
create table if not exists public.attributions (
  id             uuid default gen_random_uuid() primary key,
  user_id        uuid references auth.users on delete cascade not null unique,
  ambassador_id  uuid references public.ambassadors on delete cascade not null,
  link_id        uuid references public.ambassador_links on delete set null,
  first_touch_at timestamptz not null default now()
);
create index if not exists attributions_ambassador_idx on public.attributions (ambassador_id);

-- 5) CONVERSÃO: 1 linha por fatura paga (idempotente via UNIQUE(stripe_invoice_id))
create table if not exists public.conversions (
  id                uuid default gen_random_uuid() primary key,
  ambassador_id     uuid references public.ambassadors on delete cascade not null,
  user_id           uuid references auth.users on delete set null,
  stripe_invoice_id text not null unique,
  stripe_event_type text,
  gross_amount_cents integer not null,
  currency          text not null default 'brl',
  status            text not null default 'pending' check (status in ('pending','confirmed','refunded')),
  occurred_at       timestamptz not null default now()
);
create index if not exists conversions_ambassador_idx on public.conversions (ambassador_id);

-- RLS: ligado, sem policy permissiva → negado a anon/authenticated.
-- Todo acesso é via service_role (servidor), que ignora RLS.
alter table public.ambassadors      enable row level security;
alter table public.ambassador_links enable row level security;
alter table public.link_clicks      enable row level security;
alter table public.attributions     enable row level security;
alter table public.conversions      enable row level security;
```

- [ ] **Step 2: Aplicar a migration no Supabase**

No SQL Editor do Supabase (ou `supabase db push` se o CLI estiver linkado), cole e rode o conteúdo do arquivo. Depois rode a verificação:

```sql
select table_name, row_security
from information_schema.tables
where table_schema = 'public'
  and table_name in ('ambassadors','ambassador_links','link_clicks','attributions','conversions')
order by table_name;
```
Expected: 5 linhas, todas com `row_security = 'YES'`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/009_ambassadors.sql
git commit -m "feat(embaixadores): migration das 5 tabelas do motor de atribuicao + RLS"
```

---

### Task 2: Helper `hashIp` (pseudonimização de IP)

**Files:**
- Create: `src/lib/ambassadors/hash.ts`
- Test: `src/__tests__/unit/ambassadors-hash.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `hashIp(ip: string | null | undefined): string | null` — SHA-256 hex de `SALT + ip`; `null` se `ip` vazio. Consumido pela Task 5.

- [ ] **Step 1: Escrever o teste que falha**

Create `src/__tests__/unit/ambassadors-hash.test.ts`:

```ts
// PATH: src/__tests__/unit/ambassadors-hash.test.ts

import { hashIp } from "@/lib/ambassadors/hash";

describe("hashIp", () => {
  it("retorna null para entrada vazia", () => {
    expect(hashIp(null)).toBeNull();
    expect(hashIp(undefined)).toBeNull();
    expect(hashIp("")).toBeNull();
  });

  it("é determinístico: mesmo IP → mesmo hash", () => {
    expect(hashIp("1.2.3.4")).toBe(hashIp("1.2.3.4"));
  });

  it("IPs diferentes → hashes diferentes", () => {
    expect(hashIp("1.2.3.4")).not.toBe(hashIp("5.6.7.8"));
  });

  it("nunca devolve o IP cru (pseudonimiza)", () => {
    const h = hashIp("1.2.3.4");
    expect(h).not.toBeNull();
    expect(h).not.toContain("1.2.3.4");
    expect(h).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hex
  });
});
```

- [ ] **Step 2: Rodar o teste e ver falhar**

Run: `npm test -- src/__tests__/unit/ambassadors-hash.test.ts`
Expected: FAIL — `Cannot find module '@/lib/ambassadors/hash'`.

- [ ] **Step 3: Implementar o mínimo**

Create `src/lib/ambassadors/hash.ts`:

```ts
import { createHash } from "crypto";

// Salt de app (configurável por env). Mesmo sem env, hashear já pseudonimiza o IP
// para fins de LGPD; o salt evita reverso trivial por rainbow table.
const SALT = process.env.AMBASSADOR_IP_SALT ?? "humanah-embaixador-salt-v1";

/** SHA-256 hex de (SALT + ip). Retorna null para IP vazio. Nunca guarda o IP cru. */
export function hashIp(ip: string | null | undefined): string | null {
    if (!ip) return null;
    return createHash("sha256").update(SALT + ip).digest("hex");
}
```

- [ ] **Step 4: Rodar o teste e ver passar**

Run: `npm test -- src/__tests__/unit/ambassadors-hash.test.ts`
Expected: PASS (4 testes).

- [ ] **Step 5: Commit**

```bash
git add src/lib/ambassadors/hash.ts src/__tests__/unit/ambassadors-hash.test.ts
git commit -m "feat(embaixadores): helper hashIp (pseudonimizacao de IP p/ LGPD)"
```

---

### Task 3: `captureAttribution` (gravar first-touch)

**Files:**
- Create: `src/lib/ambassadors/attribution.ts`
- Test: `src/__tests__/unit/ambassadors-attribution.test.ts`

**Interfaces:**
- Consumes: admin client (`SupabaseClient`) com `.from(t).select().eq().maybeSingle()` e `.from(t).insert()`.
- Produces:
  - `type AttachResult = { ok: boolean; already?: boolean; reason?: string }`
  - `captureAttribution(admin: SupabaseClient, userId: string, hmnRef: string | null | undefined): Promise<AttachResult>`
  - Consumido pela Task 6.

- [ ] **Step 1: Escrever o teste que falha**

Create `src/__tests__/unit/ambassadors-attribution.test.ts`:

```ts
// PATH: src/__tests__/unit/ambassadors-attribution.test.ts

import type { SupabaseClient } from "@supabase/supabase-js";
import { captureAttribution } from "@/lib/ambassadors/attribution";

/**
 * Admin fake: `select` devolve o dado mapeado por tabela em `sel`;
 * `insert` registra a linha em `inserts[tabela]` e devolve o erro mapeado em `ins`.
 */
function makeAdmin(sel: Record<string, unknown>, ins: Record<string, { error: unknown }> = {}) {
  const inserts: Record<string, unknown[]> = {};
  const admin = {
    from: (table: string) => ({
      select: () => {
        const chain = {
          eq: () => chain,
          maybeSingle: async () => ({ data: sel[table] ?? null, error: null }),
        };
        return chain;
      },
      insert: async (row: unknown) => {
        (inserts[table] ??= []).push(row);
        return ins[table] ?? { error: null };
      },
    }),
  } as unknown as SupabaseClient;
  return { admin, inserts };
}

describe("captureAttribution", () => {
  it("sem cookie hmn_ref → ok:false", async () => {
    const { admin } = makeAdmin({});
    expect(await captureAttribution(admin, "user-1", null)).toEqual({ ok: false, reason: "sem cookie" });
  });

  it("usuário já atribuído → already:true e não insere", async () => {
    const { admin, inserts } = makeAdmin({ attributions: { id: "a1" } });
    const r = await captureAttribution(admin, "user-1", "link-1");
    expect(r).toEqual({ ok: true, already: true });
    expect(inserts.attributions).toBeUndefined();
  });

  it("link inexistente/inativo → ok:false", async () => {
    const { admin } = makeAdmin({ attributions: null, ambassador_links: null });
    const r = await captureAttribution(admin, "user-1", "link-x");
    expect(r.ok).toBe(false);
  });

  it("auto-promoção (embaixador é o próprio usuário) → ignora", async () => {
    const { admin, inserts } = makeAdmin({
      attributions: null,
      ambassador_links: { id: "link-1", ambassador_id: "amb-1", active: true },
      ambassadors: { user_id: "user-1", status: "active" },
    });
    const r = await captureAttribution(admin, "user-1", "link-1");
    expect(r.ok).toBe(false);
    expect(inserts.attributions).toBeUndefined();
  });

  it("caminho feliz → insere attributions e retorna ok:true", async () => {
    const { admin, inserts } = makeAdmin({
      attributions: null,
      ambassador_links: { id: "link-1", ambassador_id: "amb-1", active: true },
      ambassadors: { user_id: "outro-user", status: "active" },
    });
    const r = await captureAttribution(admin, "user-1", "link-1");
    expect(r).toEqual({ ok: true });
    expect(inserts.attributions).toEqual([
      { user_id: "user-1", ambassador_id: "amb-1", link_id: "link-1" },
    ]);
  });

  it("corrida (UNIQUE violation 23505) no insert → tratado como already", async () => {
    const { admin } = makeAdmin(
      {
        attributions: null,
        ambassador_links: { id: "link-1", ambassador_id: "amb-1", active: true },
        ambassadors: { user_id: "outro-user", status: "active" },
      },
      { attributions: { error: { code: "23505" } } }
    );
    const r = await captureAttribution(admin, "user-1", "link-1");
    expect(r).toEqual({ ok: true, already: true });
  });
});
```

- [ ] **Step 2: Rodar o teste e ver falhar**

Run: `npm test -- src/__tests__/unit/ambassadors-attribution.test.ts`
Expected: FAIL — módulo `@/lib/ambassadors/attribution` não existe.

- [ ] **Step 3: Implementar o mínimo**

Create `src/lib/ambassadors/attribution.ts`:

```ts
import type { SupabaseClient } from "@supabase/supabase-js";

export type AttachResult = { ok: boolean; already?: boolean; reason?: string };

/**
 * Grava a atribuição first-touch do usuário ao embaixador dono do link (hmnRef = link_id).
 * Idempotente: se já houver atribuição (ou corrida de UNIQUE), retorna already:true.
 * Guarda anti auto-promoção: embaixador não credita a si mesmo.
 */
export async function captureAttribution(
    admin: SupabaseClient,
    userId: string,
    hmnRef: string | null | undefined
): Promise<AttachResult> {
    if (!hmnRef) return { ok: false, reason: "sem cookie" };

    // Já atribuído? (UNIQUE(user_id) — first-touch)
    const { data: existing } = await admin
        .from("attributions")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();
    if (existing) return { ok: true, already: true };

    // Resolve o link ativo.
    const { data: link } = await admin
        .from("ambassador_links")
        .select("id, ambassador_id, active")
        .eq("id", hmnRef)
        .maybeSingle();
    if (!link || !link.active) return { ok: false, reason: "link inválido" };

    // Guarda anti auto-promoção.
    const { data: amb } = await admin
        .from("ambassadors")
        .select("user_id, status")
        .eq("id", link.ambassador_id)
        .maybeSingle();
    if (amb?.user_id && amb.user_id === userId) return { ok: false, reason: "auto-promoção" };

    const { error } = await admin.from("attributions").insert({
        user_id: userId,
        ambassador_id: link.ambassador_id,
        link_id: link.id,
    });
    if (error) {
        // Corrida: outro request atribuiu primeiro.
        if ((error as { code?: string }).code === "23505") return { ok: true, already: true };
        return { ok: false, reason: "erro ao gravar" };
    }
    return { ok: true };
}
```

- [ ] **Step 4: Rodar o teste e ver passar**

Run: `npm test -- src/__tests__/unit/ambassadors-attribution.test.ts`
Expected: PASS (6 testes).

- [ ] **Step 5: Commit**

```bash
git add src/lib/ambassadors/attribution.ts src/__tests__/unit/ambassadors-attribution.test.ts
git commit -m "feat(embaixadores): captureAttribution (first-touch idempotente)"
```

---

### Task 4: `creditAmbassador` (registrar conversão no pagamento)

**Files:**
- Create: `src/lib/ambassadors/credit.ts`
- Test: `src/__tests__/unit/ambassadors-credit.test.ts`

**Interfaces:**
- Consumes: admin client (mesmo shape da Task 3).
- Produces:
  - `type CreditParams = { userId: string; invoiceId: string | null; grossCents: number | null; currency: string; eventType: string }`
  - `type CreditResult = { credited: boolean; reason?: string }`
  - `creditAmbassador(admin: SupabaseClient, params: CreditParams): Promise<CreditResult>`
  - Consumido pela Task 7.

- [ ] **Step 1: Escrever o teste que falha**

Create `src/__tests__/unit/ambassadors-credit.test.ts`:

```ts
// PATH: src/__tests__/unit/ambassadors-credit.test.ts

import type { SupabaseClient } from "@supabase/supabase-js";
import { creditAmbassador } from "@/lib/ambassadors/credit";

function makeAdmin(sel: Record<string, unknown>, ins: Record<string, { error: unknown }> = {}) {
  const inserts: Record<string, unknown[]> = {};
  const admin = {
    from: (table: string) => ({
      select: () => {
        const chain = {
          eq: () => chain,
          maybeSingle: async () => ({ data: sel[table] ?? null, error: null }),
        };
        return chain;
      },
      insert: async (row: unknown) => {
        (inserts[table] ??= []).push(row);
        return ins[table] ?? { error: null };
      },
    }),
  } as unknown as SupabaseClient;
  return { admin, inserts };
}

const base = { userId: "user-1", invoiceId: "in_123", grossCents: 1990, currency: "brl", eventType: "checkout.session.completed" };

describe("creditAmbassador", () => {
  it("sem invoiceId → não credita", async () => {
    const { admin } = makeAdmin({});
    const r = await creditAmbassador(admin, { ...base, invoiceId: null });
    expect(r.credited).toBe(false);
  });

  it("usuário sem atribuição (orgânico) → não credita", async () => {
    const { admin, inserts } = makeAdmin({ attributions: null });
    const r = await creditAmbassador(admin, base);
    expect(r).toEqual({ credited: false, reason: "orgânico" });
    expect(inserts.conversions).toBeUndefined();
  });

  it("embaixador suspenso → não credita", async () => {
    const { admin, inserts } = makeAdmin({
      attributions: { ambassador_id: "amb-1" },
      ambassadors: { user_id: "outro", status: "suspended" },
    });
    const r = await creditAmbassador(admin, base);
    expect(r.credited).toBe(false);
    expect(inserts.conversions).toBeUndefined();
  });

  it("auto-compra (embaixador comprando pelo próprio link) → não credita", async () => {
    const { admin, inserts } = makeAdmin({
      attributions: { ambassador_id: "amb-1" },
      ambassadors: { user_id: "user-1", status: "active" },
    });
    const r = await creditAmbassador(admin, base);
    expect(r.credited).toBe(false);
    expect(inserts.conversions).toBeUndefined();
  });

  it("caminho feliz → insere conversão pending com o bruto", async () => {
    const { admin, inserts } = makeAdmin({
      attributions: { ambassador_id: "amb-1" },
      ambassadors: { user_id: "outro", status: "active" },
    });
    const r = await creditAmbassador(admin, base);
    expect(r).toEqual({ credited: true });
    expect(inserts.conversions).toEqual([
      {
        ambassador_id: "amb-1",
        user_id: "user-1",
        stripe_invoice_id: "in_123",
        stripe_event_type: "checkout.session.completed",
        gross_amount_cents: 1990,
        currency: "brl",
        status: "pending",
      },
    ]);
  });

  it("fatura já creditada (UNIQUE 23505) → idempotente, credited:false", async () => {
    const { admin } = makeAdmin(
      { attributions: { ambassador_id: "amb-1" }, ambassadors: { user_id: "outro", status: "active" } },
      { conversions: { error: { code: "23505" } } }
    );
    const r = await creditAmbassador(admin, base);
    expect(r).toEqual({ credited: false, reason: "já creditado" });
  });
});
```

- [ ] **Step 2: Rodar o teste e ver falhar**

Run: `npm test -- src/__tests__/unit/ambassadors-credit.test.ts`
Expected: FAIL — módulo não existe.

- [ ] **Step 3: Implementar o mínimo**

Create `src/lib/ambassadors/credit.ts`:

```ts
import type { SupabaseClient } from "@supabase/supabase-js";

export type CreditParams = {
    userId: string;
    invoiceId: string | null;
    grossCents: number | null;
    currency: string;
    eventType: string;
};
export type CreditResult = { credited: boolean; reason?: string };

/**
 * Registra 1 conversão (fatura paga) creditada ao embaixador que trouxe o usuário.
 * Não calcula comissão — guarda o bruto. Idempotente por UNIQUE(stripe_invoice_id).
 */
export async function creditAmbassador(
    admin: SupabaseClient,
    { userId, invoiceId, grossCents, currency, eventType }: CreditParams
): Promise<CreditResult> {
    if (!invoiceId) return { credited: false, reason: "sem invoice" };

    const { data: attr } = await admin
        .from("attributions")
        .select("ambassador_id")
        .eq("user_id", userId)
        .maybeSingle();
    if (!attr) return { credited: false, reason: "orgânico" };

    const { data: amb } = await admin
        .from("ambassadors")
        .select("user_id, status")
        .eq("id", attr.ambassador_id)
        .maybeSingle();
    if (amb?.status === "suspended") return { credited: false, reason: "suspenso" };
    if (amb?.user_id && amb.user_id === userId) return { credited: false, reason: "auto-compra" };

    const { error } = await admin.from("conversions").insert({
        ambassador_id: attr.ambassador_id,
        user_id: userId,
        stripe_invoice_id: invoiceId,
        stripe_event_type: eventType,
        gross_amount_cents: grossCents ?? 0,
        currency,
        status: "pending",
    });
    if (error) {
        if ((error as { code?: string }).code === "23505") return { credited: false, reason: "já creditado" };
        return { credited: false, reason: "erro ao gravar" };
    }
    return { credited: true };
}
```

- [ ] **Step 4: Rodar o teste e ver passar**

Run: `npm test -- src/__tests__/unit/ambassadors-credit.test.ts`
Expected: PASS (6 testes).

- [ ] **Step 5: Criar o barrel `index.ts` e commitar**

Create `src/lib/ambassadors/index.ts`:

```ts
export { hashIp } from "./hash";
export { captureAttribution, type AttachResult } from "./attribution";
export { creditAmbassador, type CreditParams, type CreditResult } from "./credit";
```

```bash
git add src/lib/ambassadors/credit.ts src/lib/ambassadors/index.ts src/__tests__/unit/ambassadors-credit.test.ts
git commit -m "feat(embaixadores): creditAmbassador (conversao idempotente) + barrel"
```

---

### Task 5: Rota `/e/[slug]` (registra clique + cookie + 302)

**Files:**
- Create: `src/app/e/[slug]/route.ts`
- Test: `src/__tests__/api/ambassador-link.test.ts`

**Interfaces:**
- Consumes: `hashIp` (Task 2); tabelas `ambassador_links`, `link_clicks` (Task 1).
- Produces: `GET(req, ctx)` Route Handler. Seta cookie `hmn_ref = <link_id>` (httpOnly, 90d), consumido pela Task 6.

- [ ] **Step 1: Escrever o teste que falha**

Create `src/__tests__/api/ambassador-link.test.ts`:

```ts
// PATH: src/__tests__/api/ambassador-link.test.ts

import { NextRequest } from "next/server";

const { mockLinkSingle, mockClickInsert, mockFrom } = vi.hoisted(() => {
  const mockLinkSingle = vi.fn();
  const mockClickInsert = vi.fn().mockResolvedValue({ error: null });
  const mockFrom = vi.fn((table: string) => {
    if (table === "ambassador_links") {
      const chain = { eq: () => chain, maybeSingle: mockLinkSingle };
      return { select: () => chain };
    }
    return { insert: mockClickInsert }; // link_clicks
  });
  return { mockLinkSingle, mockClickInsert, mockFrom };
});

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ from: mockFrom })),
}));

import { GET } from "@/app/e/[slug]/route";

function makeReq(slug: string) {
  return {
    req: new NextRequest(`http://localhost/e/${slug}`, {
      headers: { "x-forwarded-for": "9.9.9.9", "user-agent": "jest" },
    }),
    ctx: { params: Promise.resolve({ slug }) },
  };
}

describe("GET /e/[slug]", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
    vi.clearAllMocks();
    mockClickInsert.mockResolvedValue({ error: null });
  });

  it("slug válido → 307 para o destino, seta cookie hmn_ref e grava clique", async () => {
    mockLinkSingle.mockResolvedValue({
      data: { id: "link-1", destination: "/", active: true },
      error: null,
    });
    const { req, ctx } = makeReq("pastorjoao");
    const res = await GET(req, ctx);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/");
    expect(res.cookies.get("hmn_ref")?.value).toBe("link-1");
    expect(mockClickInsert).toHaveBeenCalledTimes(1);
    // IP nunca vai cru
    const row = mockClickInsert.mock.calls[0][0];
    expect(row.link_id).toBe("link-1");
    expect(row.ip_hash).not.toBe("9.9.9.9");
    expect(row.ip_hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("slug inválido → 307 para a home, sem cookie e sem clique", async () => {
    mockLinkSingle.mockResolvedValue({ data: null, error: null });
    const { req, ctx } = makeReq("naoexiste");
    const res = await GET(req, ctx);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/");
    expect(res.cookies.get("hmn_ref")).toBeUndefined();
    expect(mockClickInsert).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Rodar o teste e ver falhar**

Run: `npm test -- src/__tests__/api/ambassador-link.test.ts`
Expected: FAIL — `@/app/e/[slug]/route` não existe.

- [ ] **Step 3: Implementar o mínimo**

Create `src/app/e/[slug]/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hashIp } from "@/lib/ambassadors/hash";

const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const COOKIE = "hmn_ref";
const NINETY_DAYS = 60 * 60 * 24 * 90;

export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
    const { slug } = await ctx.params;
    const home = new URL("/", req.url);

    const { data: link } = await admin
        .from("ambassador_links")
        .select("id, destination, active")
        .eq("slug", slug)
        .eq("active", true)
        .maybeSingle();

    // Slug inexistente/inativo: redireciona pra home sem vazar nada.
    if (!link) return NextResponse.redirect(home);

    // Registra o clique (IP hasheado — LGPD).
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    await admin.from("link_clicks").insert({
        link_id: link.id,
        ip_hash: hashIp(ip),
        country: req.headers.get("x-vercel-ip-country") ?? null,
        device: req.headers.get("user-agent")?.slice(0, 255) ?? null,
        referrer: req.headers.get("referer") ?? null,
    });

    const dest = new URL(link.destination || "/", req.url);
    const res = NextResponse.redirect(dest);
    res.cookies.set(COOKIE, link.id, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: NINETY_DAYS,
        path: "/",
    });
    return res;
}
```

- [ ] **Step 4: Rodar o teste e ver passar**

Run: `npm test -- src/__tests__/api/ambassador-link.test.ts`
Expected: PASS (2 testes).

- [ ] **Step 5: Commit**

```bash
git add src/app/e/[slug]/route.ts src/__tests__/api/ambassador-link.test.ts
git commit -m "feat(embaixadores): rota /e/[slug] (clique + cookie hmn_ref + 302)"
```

---

### Task 6: Rota `POST /api/ambassador/attach` (captura no cadastro)

**Files:**
- Create: `src/app/api/ambassador/attach/route.ts`
- Test: `src/__tests__/api/ambassador-attach.test.ts`

**Interfaces:**
- Consumes: `createClient` de `@/lib/supabase/server` (`auth.getUser`); `cookies()` de `next/headers`; `captureAttribution` (Task 3).
- Produces: `POST()` Route Handler. Retorna o `AttachResult` como JSON (401 se não logado).

- [ ] **Step 1: Escrever o teste que falha**

Create `src/__tests__/api/ambassador-attach.test.ts`:

```ts
// PATH: src/__tests__/api/ambassador-attach.test.ts

const { mockGetUser, mockCookieGet, mockCapture } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockCookieGet: vi.fn(),
  mockCapture: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: { getUser: mockGetUser } })),
}));
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ get: mockCookieGet })),
}));
vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn(() => ({})) }));
vi.mock("@/lib/ambassadors/attribution", () => ({ captureAttribution: mockCapture }));

import { POST } from "@/app/api/ambassador/attach/route";

describe("POST /api/ambassador/attach", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
    vi.clearAllMocks();
  });

  it("sem usuário logado → 401", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await POST();
    expect(res.status).toBe(401);
  });

  it("logado → lê o cookie e delega para captureAttribution, devolvendo o resultado", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockCookieGet.mockReturnValue({ value: "link-1" });
    mockCapture.mockResolvedValue({ ok: true });

    const res = await POST();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(mockCapture).toHaveBeenCalledWith(expect.anything(), "user-1", "link-1");
  });

  it("logado sem cookie → passa null para captureAttribution", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockCookieGet.mockReturnValue(undefined);
    mockCapture.mockResolvedValue({ ok: false, reason: "sem cookie" });

    await POST();
    expect(mockCapture).toHaveBeenCalledWith(expect.anything(), "user-1", null);
  });
});
```

- [ ] **Step 2: Rodar o teste e ver falhar**

Run: `npm test -- src/__tests__/api/ambassador-attach.test.ts`
Expected: FAIL — rota não existe.

- [ ] **Step 3: Implementar o mínimo**

Create `src/app/api/ambassador/attach/route.ts`:

```ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { captureAttribution } from "@/lib/ambassadors/attribution";

const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Dispara 1x no onboarding. O cookie hmn_ref é httpOnly → lido AQUI no servidor.
export async function POST() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const cookieStore = await cookies();
    const hmnRef = cookieStore.get("hmn_ref")?.value ?? null;

    const result = await captureAttribution(admin, user.id, hmnRef);
    return NextResponse.json(result);
}
```

- [ ] **Step 4: Rodar o teste e ver passar**

Run: `npm test -- src/__tests__/api/ambassador-attach.test.ts`
Expected: PASS (3 testes).

- [ ] **Step 5: Commit**

```bash
git add src/app/api/ambassador/attach/route.ts src/__tests__/api/ambassador-attach.test.ts
git commit -m "feat(embaixadores): rota /api/ambassador/attach (captura first-touch)"
```

---

### Task 7: Plugar `creditAmbassador` no webhook Stripe

**Files:**
- Modify: `src/app/api/webhook/stripe/route.ts` (handlers `checkout.session.completed` ~64-73 e `invoice.payment_succeeded` ~75-88)
- Modify: `src/__tests__/api/webhook-stripe.test.ts`

**Interfaces:**
- Consumes: `creditAmbassador` (Task 4).
- Produces: nada novo (efeito colateral: grava `conversions`).

- [ ] **Step 1: Atualizar o teste do webhook (falha primeiro)**

Em `src/__tests__/api/webhook-stripe.test.ts`, adicione o mock de `creditAmbassador` logo após o `vi.mock("@/lib/stripe/client", ...)` (antes do `import { POST }`):

```ts
const { mockCredit } = vi.hoisted(() => ({ mockCredit: vi.fn().mockResolvedValue({ credited: true }) }));
vi.mock("@/lib/ambassadors/credit", () => ({ creditAmbassador: mockCredit }));
```

Adicione `mockCredit` ao `vi.clearAllMocks` não é necessário (clearAllMocks já limpa), mas reponha o retorno no `beforeEach`, após `mockEq.mockReturnValue(...)`:

```ts
    mockCredit.mockResolvedValue({ credited: true });
```

E adicione este teste novo ao final do `describe`:

```ts
  it("credita o embaixador em checkout.session.completed (com invoice e valor)", async () => {
    const event = makeStripeEvent("checkout.session.completed", {
      object: "checkout.session",
      metadata: { supabase_user_id: "user-abc" },
      invoice: "in_777",
      amount_total: 1990,
      currency: "brl",
    });
    mockConstructEvent.mockReturnValue(event);

    const res = await POST(makeWebhookReq("payload", "sig_valid"));
    expect(res.status).toBe(200);
    expect(mockCredit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        userId: "user-abc",
        invoiceId: "in_777",
        grossCents: 1990,
        currency: "brl",
        eventType: "checkout.session.completed",
      })
    );
  });
```

- [ ] **Step 2: Rodar o teste e ver falhar**

Run: `npm test -- src/__tests__/api/webhook-stripe.test.ts`
Expected: FAIL — `creditAmbassador` ainda não é chamado pela rota (o novo teste falha; os antigos continuam passando).

- [ ] **Step 3: Implementar — importar e chamar `creditAmbassador`**

Em `src/app/api/webhook/stripe/route.ts`, adicione o import no topo (após os imports existentes):

```ts
import { creditAmbassador } from "@/lib/ambassadors/credit";
```

No handler `checkout.session.completed`, logo após o `await logEvent(...)` e antes do `break;`:

```ts
            await creditAmbassador(admin, {
                userId: uid,
                invoiceId: typeof session.invoice === "string" ? session.invoice : null,
                grossCents: session.amount_total ?? null,
                currency: session.currency ?? "brl",
                eventType: event.type,
            });
```

No handler `invoice.payment_succeeded`, dentro do `if (uid)` — **depois** do `await upgradeUser(...)` já existente, some crédito das **renovações** (a 1ª fatura já é creditada acima e não cai aqui por causa do `if (!subId) break`):

```ts
            if (uid) {
                await upgradeUser(uid, {
                    stripe_customer_id: typeof sub.customer === "string" ? sub.customer : null,
                    stripe_subscription_id: sub.id,
                    subscription_status: sub.status,
                    subscription_current_period_end: periodEndISO(sub),
                });
                await creditAmbassador(admin, {
                    userId: uid,
                    invoiceId: invoice.id ?? null,
                    grossCents: (invoice as unknown as { amount_paid?: number }).amount_paid ?? null,
                    currency: invoice.currency ?? "brl",
                    eventType: event.type,
                });
            }
```

> Substitui o `if (uid) await upgradeUser(...)` de uma linha existente pelo bloco acima. `UNIQUE(stripe_invoice_id)` garante que, mesmo se a 1ª fatura chegasse pelos dois eventos, não há crédito duplicado.

- [ ] **Step 4: Rodar todos os testes do webhook e ver passar**

Run: `npm test -- src/__tests__/api/webhook-stripe.test.ts`
Expected: PASS (todos — os 5 antigos + o novo).

- [ ] **Step 5: Commit**

```bash
git add src/app/api/webhook/stripe/route.ts src/__tests__/api/webhook-stripe.test.ts
git commit -m "feat(embaixadores): credita embaixador no webhook (1a compra + renovacoes)"
```

---

### Task 8: Disparar o attach no onboarding + teste ponta a ponta

**Files:**
- Modify: `src/app/onboarding/page.tsx` (adiciona um `useEffect` de mount)

**Interfaces:**
- Consumes: rota `POST /api/ambassador/attach` (Task 6).
- Produces: nada (efeito de wiring no client).

- [ ] **Step 1: Adicionar o disparo fire-and-forget no onboarding**

Em `src/app/onboarding/page.tsx`, logo **após** o `useEffect` de pré-preenchimento existente (que termina na linha ~45), adicione um novo effect:

```ts
    // Captura de embaixador (first-touch): o servidor lê o cookie httpOnly hmn_ref.
    // Fire-and-forget e idempotente — roda 1x quando o usuário novo chega no onboarding.
    useEffect(() => {
        fetch("/api/ambassador/attach", { method: "POST" }).catch(() => {});
    }, []);
```

- [ ] **Step 2: Verificar lint e build do trecho**

Run: `npm run lint`
Expected: sem erros novos.

- [ ] **Step 3: Commit**

```bash
git add src/app/onboarding/page.tsx
git commit -m "feat(embaixadores): onboarding dispara captura de atribuicao (attach)"
```

- [ ] **Step 4: Rodar a suíte completa**

Run: `npm test`
Expected: todos os testes passam (incluindo os 4 arquivos novos de embaixadores).

- [ ] **Step 5: Teste manual ponta a ponta (integração real)**

Pré-requisito: migration da Task 1 aplicada. No SQL Editor do Supabase, **seed do embaixador de teste** (rodar 1x; pode apagar depois):

```sql
with amb as (
  insert into public.ambassadors (name, email, status)
  values ('Teste', 'teste@humanah.app', 'active')
  returning id
)
insert into public.ambassador_links (ambassador_id, slug, destination)
select id, 'teste', '/' from amb;
```

Fluxo (use `npm run dev` + Stripe CLI em test mode):
1. Abrir `http://localhost:3000/e/teste` → deve redirecionar pra home. Conferir:
   `select * from public.link_clicks order by clicked_at desc limit 1;` (1 linha nova, `ip_hash` preenchido/hasheado). Cookie `hmn_ref` presente no DevTools → Application → Cookies.
2. Cadastrar um **usuário novo** e passar pelo onboarding. Conferir:
   `select * from public.attributions order by first_touch_at desc limit 1;` (liga o novo `user_id` ao embaixador "Teste").
3. Assinar em test mode (`stripe listen --forward-to localhost:3000/api/webhook/stripe`). Conferir:
   `select * from public.conversions order by occurred_at desc limit 1;` (1 linha, `status='pending'`, `gross_amount_cents` correto, `ambassador_id` do "Teste").
4. **Idempotência:** reenviar o evento — `stripe events resend <evt_id>` — e conferir que **não** surge uma 2ª conversão para a mesma `stripe_invoice_id`.

Expected: cada passo cria exatamente a linha esperada; o reenvio não duplica.

- [ ] **Step 6: Push da branch**

```bash
git push -u origin feature/embaixadores
```

---

## Notas de fechamento

- **Env opcional:** `AMBASSADOR_IP_SALT` (fallback embutido). Setar em produção fortalece a pseudonimização do IP.
- **Próximas fatias** (fora deste plano): landing `/embaixadores`, formulário + curadoria, portal do embaixador, cálculo de nível/comissão gamificada, fila e envio manual de saque (Pix), kit de divulgação, export (PDF), antifraude avançado.
