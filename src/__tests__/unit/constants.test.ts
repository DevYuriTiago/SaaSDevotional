// PATH: src/__tests__/unit/constants.test.ts
import {
    EMOTION_CATEGORIES,
    FREE_DEVOTIONAL_LIMIT,
    FREE_JOURNEY_DAY_LIMIT,
    PREMIUM_PRICE,
    PREMIUM_PRICE_ANNUAL,
    PREMIUM_ANNUAL_SAVINGS,
    JOURNEY_THEMES,
    ACHIEVEMENTS,
} from "@/lib/constants";

// ─── EMOTION_CATEGORIES ───────────────────────────────────────────────────────

describe("EMOTION_CATEGORIES", () => {
    it("deve ter exatamente 10 itens", () => {
        expect(EMOTION_CATEGORIES).toHaveLength(10);
    });

    it("cada item deve ter id, label, emoji, color, description e sub_emotions", () => {
        for (const cat of EMOTION_CATEGORIES) {
            expect(cat).toHaveProperty("id");
            expect(cat).toHaveProperty("label");
            expect(cat).toHaveProperty("emoji");
            expect(cat).toHaveProperty("color");
            expect(cat).toHaveProperty("description");
            expect(cat).toHaveProperty("sub_emotions");
        }
    });

    it("sub_emotions de cada item deve ser array não-vazio", () => {
        for (const cat of EMOTION_CATEGORIES) {
            expect(Array.isArray(cat.sub_emotions)).toBe(true);
            expect(cat.sub_emotions!.length).toBeGreaterThan(0);
        }
    });

    it("todos os ids devem ser únicos", () => {
        const ids = EMOTION_CATEGORIES.map((c) => c.id);
        const unique = new Set(ids);
        expect(unique.size).toBe(ids.length);
    });

    it("todos os ids devem ser strings não-vazias", () => {
        for (const cat of EMOTION_CATEGORIES) {
            expect(typeof cat.id).toBe("string");
            expect(cat.id.length).toBeGreaterThan(0);
        }
    });

    it("todas as cores devem ser hex válidos (formato #RRGGBB ou #RGB)", () => {
        const hexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
        for (const cat of EMOTION_CATEGORIES) {
            expect(cat.color).toMatch(hexRegex);
        }
    });

    it("todos os labels devem ser strings não-vazias", () => {
        for (const cat of EMOTION_CATEGORIES) {
            expect(typeof cat.label).toBe("string");
            expect(cat.label.length).toBeGreaterThan(0);
        }
    });

    it("todos os emojis devem ser strings não-vazias", () => {
        for (const cat of EMOTION_CATEGORIES) {
            expect(typeof cat.emoji).toBe("string");
            expect(cat.emoji.length).toBeGreaterThan(0);
        }
    });

    it("todas as descriptions devem ser strings não-vazias", () => {
        for (const cat of EMOTION_CATEGORIES) {
            expect(typeof cat.description).toBe("string");
            expect(cat.description.length).toBeGreaterThan(0);
        }
    });
});

// ─── FREE_DEVOTIONAL_LIMIT ────────────────────────────────────────────────────

describe("FREE_DEVOTIONAL_LIMIT", () => {
    it("deve ser igual a 7 (trial de hábito)", () => {
        expect(FREE_DEVOTIONAL_LIMIT).toBe(7);
    });

    it("deve ser do tipo number", () => {
        expect(typeof FREE_DEVOTIONAL_LIMIT).toBe("number");
    });
});

// ─── FREE_JOURNEY_DAY_LIMIT ───────────────────────────────────────────────────

describe("FREE_JOURNEY_DAY_LIMIT", () => {
    it("deve liberar os 7 primeiros dias da jornada ao free", () => {
        expect(FREE_JOURNEY_DAY_LIMIT).toBe(7);
    });
});

// ─── PLANO ANUAL ──────────────────────────────────────────────────────────────

describe("Plano anual", () => {
    it("PREMIUM_PRICE_ANNUAL deve ser 199", () => {
        expect(PREMIUM_PRICE_ANNUAL).toBe(199);
    });

    it("deve ser mais barato que 12x o mensal", () => {
        expect(PREMIUM_PRICE_ANNUAL).toBeLessThan(PREMIUM_PRICE * 12);
    });

    it("a economia anunciada deve bater com 12x mensal menos o anual", () => {
        expect(PREMIUM_ANNUAL_SAVINGS).toBe(Math.round(PREMIUM_PRICE * 12 - PREMIUM_PRICE_ANNUAL));
    });
});

// ─── PREMIUM_PRICE ────────────────────────────────────────────────────────────

describe("PREMIUM_PRICE", () => {
    it("deve ser igual a 24.9", () => {
        expect(PREMIUM_PRICE).toBe(24.9);
    });

    it("deve ser do tipo number", () => {
        expect(typeof PREMIUM_PRICE).toBe("number");
    });

    it("deve ser um valor positivo", () => {
        expect(PREMIUM_PRICE).toBeGreaterThan(0);
    });
});

// ─── JOURNEY_THEMES ───────────────────────────────────────────────────────────

const VALID_SLUGS = ["ansiedade", "fe", "paz-interior", "identidade", "proposito", "direcao"];

describe("JOURNEY_THEMES", () => {
    it("deve ter exatamente 6 itens", () => {
        expect(JOURNEY_THEMES).toHaveLength(6);
    });

    it("cada tema deve ter slug, label, emoji, days, description, pitch, solves e phases", () => {
        for (const theme of JOURNEY_THEMES) {
            expect(theme).toHaveProperty("slug");
            expect(theme).toHaveProperty("label");
            expect(theme).toHaveProperty("emoji");
            expect(theme).toHaveProperty("days");
            expect(theme).toHaveProperty("description");
            expect(theme).toHaveProperty("pitch");
            expect(theme).toHaveProperty("solves");
            expect(theme).toHaveProperty("phases");
        }
    });

    it("todos os temas devem ter days === 21", () => {
        for (const theme of JOURNEY_THEMES) {
            expect(theme.days).toBe(21);
        }
    });

    it("cada tema deve ter exatamente 3 fases", () => {
        for (const theme of JOURNEY_THEMES) {
            expect(theme.phases).toHaveLength(3);
        }
    });

    it("todos os slugs devem ser únicos", () => {
        const slugs = JOURNEY_THEMES.map((t) => t.slug);
        const unique = new Set(slugs);
        expect(unique.size).toBe(slugs.length);
    });

    it("slugs devem ser exatamente os esperados", () => {
        const slugs = JOURNEY_THEMES.map((t) => t.slug).sort();
        expect(slugs).toEqual([...VALID_SLUGS].sort());
    });

    it("cada fase deve ter days, label, icon e description", () => {
        for (const theme of JOURNEY_THEMES) {
            for (const phase of theme.phases) {
                expect(phase).toHaveProperty("days");
                expect(phase).toHaveProperty("label");
                expect(phase).toHaveProperty("icon");
                expect(phase).toHaveProperty("description");
            }
        }
    });

    it("os labels das fases de cada tema são únicos dentro do tema", () => {
        for (const theme of JOURNEY_THEMES) {
            const labels = theme.phases.map((p) => p.label);
            const unique = new Set(labels);
            expect(unique.size).toBe(labels.length);
        }
    });
});

// ─── ACHIEVEMENTS ─────────────────────────────────────────────────────────────

describe("ACHIEVEMENTS", () => {
    it("deve ter exatamente 6 itens", () => {
        expect(ACHIEVEMENTS).toHaveLength(6);
    });

    it("cada achievement deve ter slug, title, description e icon", () => {
        for (const ach of ACHIEVEMENTS) {
            expect(ach).toHaveProperty("slug");
            expect(ach).toHaveProperty("title");
            expect(ach).toHaveProperty("description");
            expect(ach).toHaveProperty("icon");
        }
    });

    it("todos os slugs devem ser strings não-vazias", () => {
        for (const ach of ACHIEVEMENTS) {
            expect(typeof ach.slug).toBe("string");
            expect(ach.slug.length).toBeGreaterThan(0);
        }
    });

    it("todos os slugs devem ser únicos", () => {
        const slugs = ACHIEVEMENTS.map((a) => a.slug);
        const unique = new Set(slugs);
        expect(unique.size).toBe(slugs.length);
    });

    it("todos os titles devem ser strings não-vazias", () => {
        for (const ach of ACHIEVEMENTS) {
            expect(typeof ach.title).toBe("string");
            expect(ach.title.length).toBeGreaterThan(0);
        }
    });

    it("todos os icons devem ser strings não-vazias", () => {
        for (const ach of ACHIEVEMENTS) {
            expect(typeof ach.icon).toBe("string");
            expect(ach.icon.length).toBeGreaterThan(0);
        }
    });

    it("todas as descriptions devem ser strings não-vazias", () => {
        for (const ach of ACHIEVEMENTS) {
            expect(typeof ach.description).toBe("string");
            expect(ach.description.length).toBeGreaterThan(0);
        }
    });
});
