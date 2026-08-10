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

// Conta recém-criada (agora) vs. conta preexistente (40 dias atrás).
const RECENT = new Date().toISOString();
const OLD = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString();

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

  it("conta preexistente (criada há semanas) → NÃO atribui, mesmo com link válido", async () => {
    const { admin, inserts } = makeAdmin({
      attributions: null,
      profiles: { created_at: OLD },
      ambassador_links: { id: "link-1", ambassador_id: "amb-1", active: true },
      ambassadors: { user_id: "outro-user", status: "active" },
    });
    const r = await captureAttribution(admin, "user-1", "link-1");
    expect(r).toEqual({ ok: false, reason: "conta preexistente" });
    expect(inserts.attributions).toBeUndefined();
  });

  it("sem perfil → não atribui", async () => {
    const { admin } = makeAdmin({ attributions: null, profiles: null });
    const r = await captureAttribution(admin, "user-1", "link-1");
    expect(r.ok).toBe(false);
  });

  it("link inexistente/inativo → ok:false", async () => {
    const { admin } = makeAdmin({ attributions: null, profiles: { created_at: RECENT }, ambassador_links: null });
    const r = await captureAttribution(admin, "user-1", "link-x");
    expect(r.ok).toBe(false);
  });

  it("auto-promoção (embaixador é o próprio usuário) → ignora", async () => {
    const { admin, inserts } = makeAdmin({
      attributions: null,
      profiles: { created_at: RECENT },
      ambassador_links: { id: "link-1", ambassador_id: "amb-1", active: true },
      ambassadors: { user_id: "user-1", status: "active" },
    });
    const r = await captureAttribution(admin, "user-1", "link-1");
    expect(r.ok).toBe(false);
    expect(inserts.attributions).toBeUndefined();
  });

  it("conta nova + link válido → insere attributions e retorna ok:true", async () => {
    const { admin, inserts } = makeAdmin({
      attributions: null,
      profiles: { created_at: RECENT },
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
        profiles: { created_at: RECENT },
        ambassador_links: { id: "link-1", ambassador_id: "amb-1", active: true },
        ambassadors: { user_id: "outro-user", status: "active" },
      },
      { attributions: { error: { code: "23505" } } }
    );
    const r = await captureAttribution(admin, "user-1", "link-1");
    expect(r).toEqual({ ok: true, already: true });
  });
});
