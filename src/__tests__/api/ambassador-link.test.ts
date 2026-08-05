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
