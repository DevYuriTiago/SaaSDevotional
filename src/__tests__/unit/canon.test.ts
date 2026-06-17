import { parseReference, validateReference } from "@/lib/bible/canon";
import { VERSE_THEMES } from "@/lib/seo/verse-themes";

describe("parseReference", () => {
    it("faz parse de referência simples", () => {
        const r = parseReference("Filipenses 4:6");
        expect(r?.book.canonical).toBe("Filipenses");
        expect(r?.chapter).toBe(4);
        expect(r?.verse).toBe(6);
    });

    it("aceita livros com numeral e acento", () => {
        expect(parseReference("1 Coríntios 13:4")?.book.canonical).toBe("1 Coríntios");
        expect(parseReference("Salmos 23:1")?.book.canonical).toBe("Salmos");
    });

    it("normaliza sem acento e com abreviação", () => {
        expect(parseReference("salmos 23:1")?.book.canonical).toBe("Salmos");
        expect(parseReference("Sl 23:1")?.book.canonical).toBe("Salmos");
        expect(parseReference("I Coríntios 13:4")?.book.canonical).toBe("1 Coríntios");
    });

    it("aceita intervalo de versículos", () => {
        const r = parseReference("João 3:16-17");
        expect(r?.book.canonical).toBe("João");
        expect(r?.chapter).toBe(3);
        expect(r?.verse).toBe(16);
    });

    it("retorna null para livro inexistente", () => {
        expect(parseReference("Hesitações 3:4")).toBeNull();
        expect(parseReference("texto sem referência")).toBeNull();
    });
});

describe("validateReference", () => {
    it("aceita referências canônicas válidas", () => {
        expect(validateReference("Filipenses 4:6").valid).toBe(true);
        expect(validateReference("Salmos 150:6").valid).toBe(true);
        expect(validateReference("Apocalipse 22:21").valid).toBe(true);
    });

    it("rejeita capítulo além da contagem do livro", () => {
        const r = validateReference("Salmos 200:1"); // Salmos tem 150
        expect(r.valid).toBe(false);
        expect(r.reason).toMatch(/150/);
    });

    it("rejeita livro inventado", () => {
        expect(validateReference("Hesitações 3:4").valid).toBe(false);
    });

    it("rejeita capítulo inexistente em livro de 1 capítulo", () => {
        expect(validateReference("Judas 2:1").valid).toBe(false); // Judas só tem 1 capítulo
        expect(validateReference("Judas 1:3").valid).toBe(true);
    });
});

describe("Páginas SEO de versículos", () => {
    it("toda referência citada nas páginas SEO é canônica", () => {
        for (const theme of VERSE_THEMES) {
            for (const v of theme.verses) {
                const check = validateReference(v.reference);
                expect(check.valid, `${theme.slug}: "${v.reference}" — ${check.reason ?? ""}`).toBe(true);
            }
        }
    });

    it("slugs de tema são únicos", () => {
        const slugs = VERSE_THEMES.map((t) => t.slug);
        expect(new Set(slugs).size).toBe(slugs.length);
    });
});
