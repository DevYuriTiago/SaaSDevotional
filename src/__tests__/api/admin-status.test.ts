// PATH: src/__tests__/api/admin-status.test.ts

import { NextRequest } from "next/server";
import { deriveAdminToken, ADMIN_COOKIE } from "@/lib/admin/auth";

const { mockSingle, mockUpdateEq } = vi.hoisted(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
  return { mockSingle: vi.fn(), mockUpdateEq: vi.fn().mockResolvedValue({ error: null }) };
});

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: () => {
      const chain = { eq: () => chain, maybeSingle: mockSingle };
      return { select: () => chain, update: () => ({ eq: mockUpdateEq }) };
    },
  })),
}));

import { POST } from "@/app/api/admin/ambassadors/status/route";

function makeReq(body: object, authed = true) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authed) headers.cookie = `${ADMIN_COOKIE}=${deriveAdminToken("senha-correta")}`;
  return new NextRequest("http://localhost/api/admin/ambassadors/status", {
    method: "POST", headers, body: JSON.stringify(body),
  });
}

describe("POST /api/admin/ambassadors/status", () => {
  beforeEach(() => {
    process.env.ADMIN_SECRET = "senha-correta";
    vi.clearAllMocks();
    mockUpdateEq.mockResolvedValue({ error: null });
    mockSingle.mockResolvedValue({ data: { id: "amb-1", status: "active" }, error: null });
  });

  it("sem cookie de admin → 401", async () => {
    const res = await POST(makeReq({ id: "amb-1", status: "suspended" }, false));
    expect(res.status).toBe(401);
    expect(mockUpdateEq).not.toHaveBeenCalled();
  });

  it("suspende um embaixador ativo", async () => {
    const res = await POST(makeReq({ id: "amb-1", status: "suspended" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, status: "suspended" });
  });

  it("reativa um suspenso", async () => {
    mockSingle.mockResolvedValue({ data: { id: "amb-1", status: "suspended" }, error: null });
    const res = await POST(makeReq({ id: "amb-1", status: "active" }));
    expect(res.status).toBe(200);
  });

  it("recusa status fora do permitido", async () => {
    for (const status of ["rejected", "pending", "qualquer"]) {
      const res = await POST(makeReq({ id: "amb-1", status }));
      expect(res.status).toBe(422);
    }
    expect(mockUpdateEq).not.toHaveBeenCalled();
  });

  it("não mexe em quem ainda está pendente de curadoria", async () => {
    mockSingle.mockResolvedValue({ data: { id: "amb-1", status: "pending" }, error: null });
    const res = await POST(makeReq({ id: "amb-1", status: "suspended" }));
    expect(res.status).toBe(409);
    expect(mockUpdateEq).not.toHaveBeenCalled();
  });

  it("embaixador inexistente → 404", async () => {
    mockSingle.mockResolvedValue({ data: null, error: null });
    const res = await POST(makeReq({ id: "sumiu", status: "suspended" }));
    expect(res.status).toBe(404);
  });
});
