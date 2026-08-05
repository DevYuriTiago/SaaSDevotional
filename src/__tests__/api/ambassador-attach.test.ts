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
