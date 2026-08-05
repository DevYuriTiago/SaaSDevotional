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
