// PATH: src/__tests__/api/devotional-generate.test.ts

import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockGetUser = vi.fn();
const mockSingle = vi.fn();

/**
 * O mock do Supabase server precisa cobrir os seguintes fluxos da rota:
 *   1. from("profiles").select("*").eq(id).single()   → perfil do usuário
 *   2. from("devotionals").insert(...).select().single() → devocional inserido
 *   3. from("profiles").update(...).eq(id)            → atualiza contadores
 *
 * Usamos uma factory que retorna sempre `this` para permitir o encadeamento
 * fluente, e centraliza as respostas em `mockSingle` para os casos de `.single()`.
 */
function makeSupabaseClient() {
  const chainable: Record<string, () => unknown> = {};
  const methods = ["select", "eq", "update", "upsert"] as const;
  methods.forEach((m) => {
    chainable[m] = vi.fn().mockReturnValue(chainable);
  });

  (chainable as unknown as { single: typeof mockSingle }).single = mockSingle;

  const client = {
    auth: { getUser: mockGetUser },
    from: vi.fn(() => ({
      ...chainable,
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: mockSingle,
        })),
      })),
    })),
  };

  return client;
}

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => makeSupabaseClient()),
}));

vi.mock("@/lib/gemini/devotional-ai", () => ({
  analyzeEmotion: vi.fn().mockResolvedValue({
    primary_emotion: "ansioso",
    intensity: "medium",
    spiritual_context: "Momento de buscar a paz de Deus",
    biblical_themes: ["confiança", "paz", "fé"],
    recommended_tone: "acolhedor",
  }),
  generateDevotional: vi.fn().mockResolvedValue(
    JSON.stringify({
      title: "Descanse em Deus",
      verse: "Não andeis ansiosos por coisa alguma",
      verse_reference: "Filipenses 4:6",
      reflection: "Uma reflexão profunda...",
      practical_application: "Aplicação prática...",
      prayer: "Senhor, eu confio em Ti...",
      declaration: "Eu sou guardado pela paz de Deus",
      reflective_question: "O que te impede de descansar em Deus hoje?",
    })
  ),
}));

import { POST } from "@/app/api/devotional/generate/route";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeReq(body: object, headers?: Record<string, string>) {
  return new NextRequest("http://localhost/api/devotional/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

const MOCK_USER = { id: "user-uuid-1", user_metadata: { name: "Yuri" } };

const PREMIUM_PROFILE = {
  id: "user-uuid-1",
  name: "Yuri",
  subscription_tier: "premium",
  devotionals_used: 5,
  total_devotionals: 10,
  streak_days: 3,
  last_devotional_date: null,
};

const FREE_PROFILE_AT_LIMIT = {
  id: "user-uuid-1",
  name: "Yuri",
  subscription_tier: "free",
  devotionals_used: 1,
  total_devotionals: 1,
  streak_days: 0,
  last_devotional_date: null,
};

const MOCK_DEVOTIONAL_ROW = {
  id: "dev-uuid-1",
  user_id: "user-uuid-1",
  title: "Descanse em Deus",
  verse: "Não andeis ansiosos por coisa alguma",
  verse_reference: "Filipenses 4:6",
  reflection: "Uma reflexão profunda...",
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("POST /api/devotional/generate", () => {
  beforeEach(() => {
    process.env.MASTER_MODE = undefined as unknown as string;
    vi.clearAllMocks();
  });

  it("retorna 401 quando o usuário não está autenticado", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await POST(makeReq({ emotion_raw: "ansioso" }));
    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json.error).toMatch(/autorizado/i);
  });

  it("retorna 402 com free_limit_reached quando usuário free já usou o limite", async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER } });

    // Primeira chamada a .single() retorna o perfil free no limite
    mockSingle.mockResolvedValueOnce({ data: FREE_PROFILE_AT_LIMIT, error: null });

    const res = await POST(makeReq({ emotion_raw: "ansioso" }));
    expect(res.status).toBe(402);

    const json = await res.json();
    expect(json.error).toBe("limit_reached");
  });

  it("retorna 200 com objeto devotional para usuário premium", async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER } });

    // 1ª chamada: busca perfil  →  perfil premium
    mockSingle
      .mockResolvedValueOnce({ data: PREMIUM_PROFILE, error: null })
      // 2ª chamada: insert devocional → devolve linha salva
      .mockResolvedValueOnce({ data: MOCK_DEVOTIONAL_ROW, error: null });

    const res = await POST(makeReq({ emotion_raw: "ansioso" }));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toHaveProperty("devotional");
    expect(json.devotional).toMatchObject({ title: "Descanse em Deus" });
    expect(json).toHaveProperty("emotion_analysis");
    expect(json.emotion_analysis.primary_emotion).toBe("ansioso");
  });
});
