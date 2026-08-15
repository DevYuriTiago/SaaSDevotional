// PATH: src/__tests__/unit/ambassadors-portal.test.ts

import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveAmbassador, type PortalUser } from "@/lib/ambassadors/portal";

/**
 * Admin fake. `byUser` é a inscrição já vinculada ao user_id;
 * `byEmail` é a inscrição ativa encontrada pelo e-mail.
 * Registra os updates para verificarmos o vínculo.
 */
function makeAdmin(opts: { byUser?: unknown; byEmail?: unknown } = {}) {
  const updates: unknown[] = [];
  let call = 0;
  const admin = {
    from: () => ({
      select: () => {
        const chain = {
          eq: () => chain,
          ilike: () => chain,
          maybeSingle: async () => {
            // 1ª consulta: por user_id. 2ª consulta: por e-mail.
            call += 1;
            const data = call === 1 ? opts.byUser ?? null : opts.byEmail ?? null;
            return { data, error: null };
          },
        };
        return chain;
      },
      update: (row: unknown) => {
        updates.push(row);
        return { eq: async () => ({ error: null }) };
      },
    }),
  } as unknown as SupabaseClient;
  return { admin, updates };
}

const CONFIRMED: PortalUser = {
  id: "user-1",
  email: "joao@igreja.com",
  email_confirmed_at: "2026-08-01T10:00:00Z",
};

const AMB = { id: "amb-1", name: "Pastor João", user_id: null, ambassador_links: [{ slug: "pastorjoao" }] };

describe("resolveAmbassador", () => {
  it("usuário já vinculado: devolve direto, sem novo vínculo", async () => {
    const { admin, updates } = makeAdmin({ byUser: { ...AMB, user_id: "user-1" } });
    const r = await resolveAmbassador(admin, CONFIRMED);
    expect(r).toEqual({ id: "amb-1", name: "Pastor João", slug: "pastorjoao", pixKey: null, donationPercent: 0, donationTarget: null });
    expect(updates).toHaveLength(0);
  });

  it("primeira visita com e-mail confirmado: vincula e devolve", async () => {
    const { admin, updates } = makeAdmin({ byEmail: AMB });
    const r = await resolveAmbassador(admin, CONFIRMED);
    expect(r?.slug).toBe("pastorjoao");
    expect(updates).toEqual([{ user_id: "user-1" }]);
  });

  it("e-mail NÃO confirmado: não vincula nem devolve", async () => {
    const { admin, updates } = makeAdmin({ byEmail: AMB });
    const r = await resolveAmbassador(admin, { ...CONFIRMED, email_confirmed_at: null });
    expect(r).toBeNull();
    expect(updates).toHaveLength(0);
  });

  it("sem inscrição ativa para o e-mail: devolve null", async () => {
    const { admin } = makeAdmin({});
    expect(await resolveAmbassador(admin, CONFIRMED)).toBeNull();
  });

  it("inscrição já pertence a outro usuário: não rouba o vínculo", async () => {
    const { admin, updates } = makeAdmin({ byEmail: { ...AMB, user_id: "outro-user" } });
    const r = await resolveAmbassador(admin, CONFIRMED);
    expect(r).toBeNull();
    expect(updates).toHaveLength(0);
  });

  it("usuário sem e-mail: devolve null", async () => {
    const { admin } = makeAdmin({ byEmail: AMB });
    expect(await resolveAmbassador(admin, { ...CONFIRMED, email: null })).toBeNull();
  });

  it("embaixador aprovado que ainda não tem link gerado: devolve sem slug", async () => {
    const { admin } = makeAdmin({ byUser: { ...AMB, user_id: "user-1", ambassador_links: [] } });
    const r = await resolveAmbassador(admin, CONFIRMED);
    expect(r).toEqual({ id: "amb-1", name: "Pastor João", slug: null, pixKey: null, donationPercent: 0, donationTarget: null });
  });
});
