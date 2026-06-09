// PATH: src/__tests__/unit/store.test.ts
import { renderHook, act } from "@testing-library/react";

// Mock do middleware persist para evitar dependência de localStorage nos testes
vi.mock("zustand/middleware", async (importOriginal) => {
    const actual = await importOriginal<typeof import("zustand/middleware")>();
    return { ...actual, persist: (fn: unknown) => fn };
});

// Imports após o mock para garantir que os stores usem a versão mockada
import { useAuthStore, useDevotionalStore, useUIStore } from "@/store/index";
import type { User, Devotional, EmotionAnalysis } from "@/types";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockUser: User = {
    id: "user-1",
    email: "teste@exemplo.com",
    name: "Usuário Teste",
    avatar_url: null,
    subscription_tier: "free",
    devotionals_used: 0,
    streak_days: 0,
    total_devotionals: 0,
    onboarding_completed: false,
    night_mode_preference: false,
    created_at: "2024-01-01T00:00:00.000Z",
};

const mockDevotional: Devotional = {
    id: "dev-1",
    user_id: "user-1",
    emotion: "ansioso",
    emotion_raw: "Estou muito ansioso hoje",
    title: "A Paz que Excede",
    verse: "Não andem ansiosos por coisa alguma.",
    verse_reference: "Filipenses 4:6",
    reflection: "Reflexão sobre ansiedade",
    practical_application: "Aplicação prática",
    prayer: "Oração do dia",
    declaration: "Declaração de fé",
    reflective_question: "O que está te preocupando?",
    is_saved: false,
    created_at: "2024-01-01T00:00:00.000Z",
};

const mockAnalysis: EmotionAnalysis = {
    primary_emotion: "ansiedade",
    intensity: "high",
    spiritual_context: "Contexto espiritual de prova",
    biblical_themes: ["fé", "paz", "confiança"],
    recommended_tone: "acolhedor",
};

// ─── useAuthStore ─────────────────────────────────────────────────────────────

describe("useAuthStore", () => {
    beforeEach(() => {
        useAuthStore.setState({ user: null });
    });

    it("estado inicial: user deve ser null", () => {
        const { result } = renderHook(() => useAuthStore());
        expect(result.current.user).toBeNull();
    });

    it("setUser define o usuário no store", () => {
        const { result } = renderHook(() => useAuthStore());
        act(() => {
            result.current.setUser(mockUser);
        });
        expect(result.current.user).toEqual(mockUser);
    });

    it("setUser(null) limpa o usuário do store", () => {
        const { result } = renderHook(() => useAuthStore());
        act(() => {
            result.current.setUser(mockUser);
        });
        act(() => {
            result.current.setUser(null);
        });
        expect(result.current.user).toBeNull();
    });

    it("setUser substitui um usuário existente por outro", () => {
        const { result } = renderHook(() => useAuthStore());
        const outroUser: User = { ...mockUser, id: "user-2", email: "outro@exemplo.com" };
        act(() => {
            result.current.setUser(mockUser);
        });
        act(() => {
            result.current.setUser(outroUser);
        });
        expect(result.current.user?.id).toBe("user-2");
    });

    it("setUser persiste todas as propriedades do objeto User", () => {
        const { result } = renderHook(() => useAuthStore());
        act(() => {
            result.current.setUser(mockUser);
        });
        expect(result.current.user?.email).toBe("teste@exemplo.com");
        expect(result.current.user?.subscription_tier).toBe("free");
    });
});

// ─── useDevotionalStore ───────────────────────────────────────────────────────

describe("useDevotionalStore", () => {
    beforeEach(() => {
        useDevotionalStore.setState({
            currentEmotion: "",
            currentEmotionRaw: "",
            emotionAnalysis: null,
            currentDevotional: null,
            isGenerating: false,
        });
    });

    it("estado inicial: todas as propriedades de dados são vazias/null/false", () => {
        const { result } = renderHook(() => useDevotionalStore());
        expect(result.current.currentEmotion).toBe("");
        expect(result.current.currentEmotionRaw).toBe("");
        expect(result.current.emotionAnalysis).toBeNull();
        expect(result.current.currentDevotional).toBeNull();
        expect(result.current.isGenerating).toBe(false);
    });

    it("setEmotion define currentEmotion e currentEmotionRaw", () => {
        const { result } = renderHook(() => useDevotionalStore());
        act(() => {
            result.current.setEmotion("ansioso", "Estou muito ansioso hoje");
        });
        expect(result.current.currentEmotion).toBe("ansioso");
        expect(result.current.currentEmotionRaw).toBe("Estou muito ansioso hoje");
    });

    it("setEmotionAnalysis define emotionAnalysis", () => {
        const { result } = renderHook(() => useDevotionalStore());
        act(() => {
            result.current.setEmotionAnalysis(mockAnalysis);
        });
        expect(result.current.emotionAnalysis).toEqual(mockAnalysis);
        expect(result.current.emotionAnalysis?.intensity).toBe("high");
    });

    it("setDevotional define currentDevotional", () => {
        const { result } = renderHook(() => useDevotionalStore());
        act(() => {
            result.current.setDevotional(mockDevotional);
        });
        expect(result.current.currentDevotional).toEqual(mockDevotional);
        expect(result.current.currentDevotional?.id).toBe("dev-1");
    });

    it("setGenerating(true) define isGenerating como true", () => {
        const { result } = renderHook(() => useDevotionalStore());
        act(() => {
            result.current.setGenerating(true);
        });
        expect(result.current.isGenerating).toBe(true);
    });

    it("setGenerating(false) define isGenerating como false", () => {
        const { result } = renderHook(() => useDevotionalStore());
        act(() => {
            result.current.setGenerating(true);
        });
        act(() => {
            result.current.setGenerating(false);
        });
        expect(result.current.isGenerating).toBe(false);
    });

    it("reset() restaura todas as propriedades ao estado inicial", () => {
        const { result } = renderHook(() => useDevotionalStore());

        // Popula o store com dados
        act(() => {
            result.current.setEmotion("triste", "Me sinto muito triste");
            result.current.setEmotionAnalysis(mockAnalysis);
            result.current.setDevotional(mockDevotional);
            result.current.setGenerating(true);
        });

        // Confirma que os dados foram definidos
        expect(result.current.currentEmotion).toBe("triste");
        expect(result.current.isGenerating).toBe(true);

        // Executa reset e verifica o estado inicial
        act(() => {
            result.current.reset();
        });

        expect(result.current.currentEmotion).toBe("");
        expect(result.current.currentEmotionRaw).toBe("");
        expect(result.current.emotionAnalysis).toBeNull();
        expect(result.current.currentDevotional).toBeNull();
        expect(result.current.isGenerating).toBe(false);
    });

    it("reset() não afeta as actions (funções permanecem disponíveis)", () => {
        const { result } = renderHook(() => useDevotionalStore());
        act(() => {
            result.current.reset();
        });
        expect(typeof result.current.setEmotion).toBe("function");
        expect(typeof result.current.setDevotional).toBe("function");
        expect(typeof result.current.reset).toBe("function");
    });
});

// ─── useUIStore ───────────────────────────────────────────────────────────────

describe("useUIStore", () => {
    beforeEach(() => {
        useUIStore.setState({ nightMode: false, sidebarOpen: false });
    });

    it("estado inicial: nightMode deve ser false", () => {
        const { result } = renderHook(() => useUIStore());
        expect(result.current.nightMode).toBe(false);
    });

    it("estado inicial: sidebarOpen deve ser false", () => {
        const { result } = renderHook(() => useUIStore());
        expect(result.current.sidebarOpen).toBe(false);
    });

    it("toggleNightMode alterna false → true", () => {
        const { result } = renderHook(() => useUIStore());
        act(() => {
            result.current.toggleNightMode();
        });
        expect(result.current.nightMode).toBe(true);
    });

    it("toggleNightMode alterna true → false (toggle duplo)", () => {
        const { result } = renderHook(() => useUIStore());
        act(() => {
            result.current.toggleNightMode();
        });
        act(() => {
            result.current.toggleNightMode();
        });
        expect(result.current.nightMode).toBe(false);
    });

    it("toggleNightMode funciona em sequência: false → true → false", () => {
        const { result } = renderHook(() => useUIStore());
        expect(result.current.nightMode).toBe(false);

        act(() => { result.current.toggleNightMode(); });
        expect(result.current.nightMode).toBe(true);

        act(() => { result.current.toggleNightMode(); });
        expect(result.current.nightMode).toBe(false);
    });

    it("setSidebarOpen(true) abre o sidebar", () => {
        const { result } = renderHook(() => useUIStore());
        act(() => {
            result.current.setSidebarOpen(true);
        });
        expect(result.current.sidebarOpen).toBe(true);
    });

    it("setSidebarOpen(false) fecha o sidebar", () => {
        const { result } = renderHook(() => useUIStore());
        act(() => {
            result.current.setSidebarOpen(true);
        });
        act(() => {
            result.current.setSidebarOpen(false);
        });
        expect(result.current.sidebarOpen).toBe(false);
    });

    it("nightMode e sidebarOpen são independentes entre si", () => {
        const { result } = renderHook(() => useUIStore());
        act(() => {
            result.current.toggleNightMode();
            result.current.setSidebarOpen(true);
        });
        expect(result.current.nightMode).toBe(true);
        expect(result.current.sidebarOpen).toBe(true);

        act(() => {
            result.current.toggleNightMode();
        });
        // nightMode volta a false, sidebarOpen permanece true
        expect(result.current.nightMode).toBe(false);
        expect(result.current.sidebarOpen).toBe(true);
    });
});
