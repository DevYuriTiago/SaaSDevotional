// PATH: src/__tests__/api/admin-payouts.test.ts

import { NextRequest } from "next/server";
import { deriveAdminToken, ADMIN_COOKIE } from "@/lib/admin/auth";

const { mockStatsSingle, mockConversions, mockPayoutInsert, mockStampIn, mockFrom } = vi.hoisted(() => {
  const mockStatsSingle = vi.fn();
  const mockConversions = vi.fn();
  const mockPayoutInsert = vi.fn();
  const mockStampIn = vi.fn().mockResolvedValue({ error: null });

  const mockFrom = vi.fn((table: string) => {
    if (table === "ambassador_stats") {
      const chain = { eq: () => chain, maybeSingle: mockStatsSingle };
      return { select: () => chain };
    }
    if (table === "ambassador_payouts") {
      return { insert: () => ({ select: () => ({ single: mockPayoutInsert }) }) };
    }
    // conversions: leitura das elegíveis e carimbo do payout_id
    const readChain = {
      eq: () => readChain,
      is: () => readChain,
      lte: () => readChain,
      neq: () => readChain,
      order: () => mockConversions(),
    };
    return {
      select: () => readChain,
      update: () => ({ in: mockStampIn }),
    };
  });

  return { mockStatsSingle, mockConversions, mockPayoutInsert, mockStampIn, mockFrom };
});

vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn(() => ({ from: mockFrom })) }));

import { POST } from "@/app/api/admin/payouts/route";

function makeReq(body: object, authed = true) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authed) headers.cookie = `${ADMIN_COOKIE}=${deriveAdminToken("senha-correta")}`;
  return new NextRequest("http://localhost/api/admin/payouts", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

describe("POST /api/admin/payouts", () => {
  beforeEach(() => {
    process.env.ADMIN_SECRET = "senha-correta";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
    vi.clearAllMocks();

    // 100 pagantes = Bronze (5%)
    mockStatsSingle.mockResolvedValue({ data: { paying_count: 100 }, error: null });
    mockConversions.mockResolvedValue({
      data: [
        { id: "c1", gross_amount_cents: 2490, occurred_at: "2026-08-01T10:00:00Z" },
        { id: "c2", gross_amount_cents: 2490, occurred_at: "2026-08-03T10:00:00Z" },
      ],
      error: null,
    });
    mockPayoutInsert.mockResolvedValue({ data: { id: "payout-1" }, error: null });
    mockStampIn.mockResolvedValue({ error: null });
  });

  it("sem cookie de admin → 401 e nada é gravado", async () => {
    const res = await POST(makeReq({ ambassadorId: "amb-1" }, false));
    expect(res.status).toBe(401);
    expect(mockPayoutInsert).not.toHaveBeenCalled();
    expect(mockStampIn).not.toHaveBeenCalled();
  });

  it("sem ambassadorId → 422", async () => {
    const res = await POST(makeReq({}));
    expect(res.status).toBe(422);
  });

  it("sem conversões elegíveis → 422 e nenhum saque criado", async () => {
    mockConversions.mockResolvedValue({ data: [], error: null });
    const res = await POST(makeReq({ ambassadorId: "amb-1" }));
    expect(res.status).toBe(422);
    expect(mockPayoutInsert).not.toHaveBeenCalled();
  });

  it("caminho feliz: calcula a comissão pela taxa do nível e carimba as conversões", async () => {
    const res = await POST(makeReq({ ambassadorId: "amb-1" }));
    expect(res.status).toBe(200);

    const json = await res.json();
    // bruto 4980 × 5% (Bronze) = 249
    expect(json.amountCents).toBe(249);
    expect(json.conversionsCount).toBe(2);

    // carimba exatamente as conversões lidas, não um intervalo solto
    expect(mockStampIn).toHaveBeenCalledWith("id", ["c1", "c2"]);
  });

  it("se a criação do saque falhar, nenhuma conversão é carimbada", async () => {
    mockPayoutInsert.mockResolvedValue({ data: null, error: { message: "falhou" } });
    const res = await POST(makeReq({ ambassadorId: "amb-1" }));
    expect(res.status).toBe(500);
    expect(mockStampIn).not.toHaveBeenCalled();
  });

  it("usa a taxa do nível atual do embaixador", async () => {
    // 250 pagantes = Ouro (15%)
    mockStatsSingle.mockResolvedValue({ data: { paying_count: 250 }, error: null });
    const json = await (await POST(makeReq({ ambassadorId: "amb-1" }))).json();
    expect(json.amountCents).toBe(747); // 4980 × 15%
  });
});
