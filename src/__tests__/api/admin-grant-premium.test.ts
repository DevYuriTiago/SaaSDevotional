// PATH: src/__tests__/api/admin-grant-premium.test.ts

import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Mocks — vi.hoisted garante que as variáveis sejam içadas junto com vi.mock
// ---------------------------------------------------------------------------

const { mockEq, mockFrom, mockListUsers } = vi.hoisted(() => {
  const mockEq = vi.fn().mockReturnValue({ error: null });
  const mockFrom = vi.fn(() => ({ update: () => ({ eq: mockEq }) }));
  const mockListUsers = vi.fn();
  return { mockEq, mockFrom, mockListUsers };
});

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: { admin: { listUsers: mockListUsers } },
    from: mockFrom,
  })),
}));

// Route is imported AFTER mocks so the module-level `createClient()` call
// inside the route picks up the mock.
import { POST } from "@/app/api/admin/grant-premium/route";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeReq(body: object, headers?: Record<string, string>) {
  return new NextRequest("http://localhost/api/admin/grant-premium", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

const VALID_AUTH = { Authorization: "Bearer test-secret" };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("POST /api/admin/grant-premium", () => {
  beforeEach(() => {
    process.env.ADMIN_SECRET = "test-secret";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";

    vi.clearAllMocks();
    mockEq.mockReturnValue({ error: null });
  });

  it("retorna 401 quando o header Authorization está ausente", async () => {
    const res = await POST(makeReq({ email: "user@test.com" }));
    expect(res.status).toBe(401);
  });

  it("retorna 401 quando o secret está errado", async () => {
    const res = await POST(
      makeReq({ email: "user@test.com" }, { Authorization: "Bearer wrong-secret" })
    );
    expect(res.status).toBe(401);
  });

  it("retorna 400 quando o body não contém email", async () => {
    const res = await POST(makeReq({}, VALID_AUTH));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/email/i);
  });

  it("retorna 404 quando o email não está cadastrado no Supabase Auth", async () => {
    mockListUsers.mockResolvedValue({ data: { users: [] }, error: null });

    const res = await POST(makeReq({ email: "notfound@test.com" }, VALID_AUTH));
    expect(res.status).toBe(404);
  });

  it("retorna 200 com { success: true, tier: 'premium' } para concessão de premium", async () => {
    mockListUsers.mockResolvedValue({
      data: { users: [{ id: "uuid-123", email: "user@test.com" }] },
      error: null,
    });

    const res = await POST(makeReq({ email: "user@test.com" }, VALID_AUTH));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.tier).toBe("premium");
  });

  it("retorna 200 com { tier: 'free' } quando revoke é true", async () => {
    mockListUsers.mockResolvedValue({
      data: { users: [{ id: "uuid-123", email: "user@test.com" }] },
      error: null,
    });

    const res = await POST(
      makeReq({ email: "user@test.com", revoke: true }, VALID_AUTH)
    );
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.tier).toBe("free");
  });
});
