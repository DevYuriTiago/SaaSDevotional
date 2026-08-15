// PATH: src/__tests__/api/ambassador-link.test.ts

import { NextRequest } from "next/server";

const { mockLinkSingle, mockRecentSingle, mockClickInsert, mockFrom } = vi.hoisted(() => {
  const mockLinkSingle = vi.fn();
  const mockRecentSingle = vi.fn();
  const mockClickInsert = vi.fn().mockResolvedValue({ error: null });

  const mockFrom = vi.fn((table: string) => {
    if (table === "ambassador_links") {
      const chain = { eq: () => chain, maybeSingle: mockLinkSingle };
      return { select: () => chain };
    }
    // link_clicks: consulta de clique recente e inserção
    const chain = { eq: () => chain, gte: () => chain, maybeSingle: mockRecentSingle };
    return { select: () => chain, insert: mockClickInsert };
  });

  return { mockLinkSingle, mockRecentSingle, mockClickInsert, mockFrom };
});

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ from: mockFrom })),
}));

import { GET } from "@/app/e/[slug]/route";

function makeReq(slug: string, headers: Record<string, string> = {}) {
  return {
    req: new NextRequest(`http://localhost/e/${slug}`, {
      headers: { "x-forwarded-for": "9.9.9.9", "user-agent": "jest", ...headers },
    }),
    ctx: { params: Promise.resolve({ slug }) },
  };
}

/** Última linha inserida em link_clicks. */
function linhaInserida() {
  return mockClickInsert.mock.calls[0][0];
}

describe("GET /e/[slug]", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
    vi.clearAllMocks();
    mockClickInsert.mockResolvedValue({ error: null });
    mockRecentSingle.mockResolvedValue({ data: null, error: null }); // sem clique recente
    mockLinkSingle.mockResolvedValue({
      data: { id: "link-1", destination: "/", active: true },
      error: null,
    });
  });

  it("clique real: redireciona, seta cookie e grava clique limpo", async () => {
    const { req, ctx } = makeReq("pastorjoao", { "sec-fetch-dest": "document" });
    const res = await GET(req, ctx);

    expect(res.status).toBe(307);
    expect(res.cookies.get("hmn_ref")?.value).toBe("link-1");

    const linha = linhaInserida();
    expect(linha.blocked_reason).toBeNull();
    // IP nunca vai cru
    expect(linha.ip_hash).not.toBe("9.9.9.9");
    expect(linha.ip_hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("slug inválido: redireciona sem cookie e sem gravar clique", async () => {
    mockLinkSingle.mockResolvedValue({ data: null, error: null });
    const { req, ctx } = makeReq("naoexiste");
    const res = await GET(req, ctx);

    expect(res.status).toBe(307);
    expect(res.cookies.get("hmn_ref")).toBeUndefined();
    expect(mockClickInsert).not.toHaveBeenCalled();
  });

  it("cookie stuffing via iframe: NÃO seta cookie, mas registra a tentativa", async () => {
    const { req, ctx } = makeReq("pastorjoao", { "sec-fetch-dest": "iframe" });
    const res = await GET(req, ctx);

    // redireciona igual, para não revelar a defesa
    expect(res.status).toBe(307);
    expect(res.cookies.get("hmn_ref")).toBeUndefined();
    expect(linhaInserida().blocked_reason).toBe("carregamento invisivel");
  });

  it("carregamento como imagem também é bloqueado", async () => {
    const { req, ctx } = makeReq("pastorjoao", { "sec-fetch-dest": "image" });
    const res = await GET(req, ctx);
    expect(res.cookies.get("hmn_ref")).toBeUndefined();
  });

  it("clique repetido do mesmo IP: mantém o cookie mas não conta na métrica", async () => {
    mockRecentSingle.mockResolvedValue({ data: { id: "clique-anterior" }, error: null });
    const { req, ctx } = makeReq("pastorjoao", { "sec-fetch-dest": "document" });
    const res = await GET(req, ctx);

    expect(res.cookies.get("hmn_ref")?.value).toBe("link-1");
    expect(linhaInserida().blocked_reason).toBe("clique repetido");
  });

  it("navegador que não envia Sec-Fetch-Dest continua funcionando", async () => {
    const { req, ctx } = makeReq("pastorjoao");
    const res = await GET(req, ctx);

    expect(res.cookies.get("hmn_ref")?.value).toBe("link-1");
    expect(linhaInserida().blocked_reason).toBeNull();
  });
});
