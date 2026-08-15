// PATH: src/__tests__/api/ambassador-payment.test.ts

import { NextRequest } from "next/server";
import { validatePaymentPrefs } from "@/lib/ambassadors/payment";

// A rota cria o cliente admin no topo do módulo, então as variáveis precisam
// existir antes do import. vi.hoisted roda antes de tudo.
const { mockGetUser, mockResolve, mockUpdateEq } = vi.hoisted(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
  return {
    mockGetUser: vi.fn(),
    mockResolve: vi.fn(),
    mockUpdateEq: vi.fn().mockResolvedValue({ error: null }),
  };
});

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: { getUser: mockGetUser } })),
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ from: () => ({ update: () => ({ eq: mockUpdateEq }) }) })),
}));
vi.mock("@/lib/ambassadors/portal", () => ({ resolveAmbassador: mockResolve }));

import { POST } from "@/app/api/ambassador/payment/route";

function makeReq(body: object) {
  return new NextRequest("http://localhost/api/ambassador/payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// validatePaymentPrefs (pura)
// ---------------------------------------------------------------------------

describe("validatePaymentPrefs", () => {
  it("aceita chave Pix comum e sem doação", () => {
    const r = validatePaymentPrefs({ pixKey: "joao@igreja.com", donationPercent: 0 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.pix_key).toBe("joao@igreja.com");
  });

  it("aceita os vários formatos de chave sem tentar adivinhar o tipo", () => {
    // CPF, telefone, e-mail e chave aleatória são todos válidos no Pix.
    for (const chave of [
      "12345678901",
      "+5511912345678",
      "pastor@igreja.com.br",
      "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    ]) {
      expect(validatePaymentPrefs({ pixKey: chave, donationPercent: 0 }).ok).toBe(true);
    }
  });

  it("recusa chave vazia ou curta demais para ser real", () => {
    expect(validatePaymentPrefs({ pixKey: "", donationPercent: 0 }).ok).toBe(false);
    expect(validatePaymentPrefs({ pixKey: "ab", donationPercent: 0 }).ok).toBe(false);
  });

  it("recusa doação fora de 0 a 100", () => {
    expect(validatePaymentPrefs({ pixKey: "joao@igreja.com", donationPercent: -1 }).ok).toBe(false);
    expect(validatePaymentPrefs({ pixKey: "joao@igreja.com", donationPercent: 101 }).ok).toBe(false);
    expect(validatePaymentPrefs({ pixKey: "joao@igreja.com", donationPercent: 12.5 }).ok).toBe(false);
  });

  it("exige destino quando há doação", () => {
    const semDestino = validatePaymentPrefs({ pixKey: "joao@igreja.com", donationPercent: 50 });
    expect(semDestino.ok).toBe(false);

    const comDestino = validatePaymentPrefs({
      pixKey: "joao@igreja.com", donationPercent: 50, donationTarget: "Igreja Vida",
    });
    expect(comDestino.ok).toBe(true);
  });

  it("limpa o destino quando a doação é zero", () => {
    const r = validatePaymentPrefs({
      pixKey: "joao@igreja.com", donationPercent: 0, donationTarget: "sobra de antes",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.donation_target).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// POST /api/ambassador/payment
// ---------------------------------------------------------------------------

describe("POST /api/ambassador/payment", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
    vi.clearAllMocks();
    mockUpdateEq.mockResolvedValue({ error: null });
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1", email: "joao@igreja.com", email_confirmed_at: "2026-08-01" } } });
    mockResolve.mockResolvedValue({ id: "amb-1", name: "Pastor João", slug: "pastorjoao" });
  });

  it("sem login → 401", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await POST(makeReq({ pixKey: "joao@igreja.com", donationPercent: 0 }));
    expect(res.status).toBe(401);
    expect(mockUpdateEq).not.toHaveBeenCalled();
  });

  it("logado mas não é embaixador → 403", async () => {
    mockResolve.mockResolvedValue(null);
    const res = await POST(makeReq({ pixKey: "joao@igreja.com", donationPercent: 0 }));
    expect(res.status).toBe(403);
    expect(mockUpdateEq).not.toHaveBeenCalled();
  });

  it("dados inválidos → 422 sem gravar", async () => {
    const res = await POST(makeReq({ pixKey: "x", donationPercent: 0 }));
    expect(res.status).toBe(422);
    expect(mockUpdateEq).not.toHaveBeenCalled();
  });

  it("caminho feliz: grava chave e doação no próprio cadastro", async () => {
    const res = await POST(makeReq({
      pixKey: "joao@igreja.com", donationPercent: 100, donationTarget: "Igreja Vida",
    }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(mockUpdateEq).toHaveBeenCalledWith("id", "amb-1");
  });
});
