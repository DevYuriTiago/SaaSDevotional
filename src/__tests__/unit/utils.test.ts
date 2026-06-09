// PATH: src/__tests__/unit/utils.test.ts
import { cn, formatDate, formatShortDate, truncate, sleep } from "@/lib/utils";

// ─── cn ────────────────────────────────────────────────────────────────────────

describe("cn", () => {
    it("retorna string vazia quando nenhum argumento é passado", () => {
        expect(cn()).toBe("");
    });

    it("retorna uma única classe sem alteração", () => {
        expect(cn("text-red-500")).toBe("text-red-500");
    });

    it("concatena múltiplas classes", () => {
        expect(cn("text-sm", "font-bold")).toBe("text-sm font-bold");
    });

    it("resolve conflito de classes Tailwind mantendo a última", () => {
        expect(cn("p-4", "p-2")).toBe("p-2");
    });

    it("ignora valores falsy (undefined, null, false)", () => {
        expect(cn("text-sm", undefined, null as never, false as never)).toBe("text-sm");
    });

    it("suporta objetos condicionais do clsx", () => {
        expect(cn({ "text-red-500": true, "text-blue-500": false })).toBe("text-red-500");
    });

    it("suporta arrays aninhados", () => {
        expect(cn(["text-sm", "font-bold"])).toBe("text-sm font-bold");
    });
});

// ─── formatDate ───────────────────────────────────────────────────────────────

describe("formatDate", () => {
    it("formata uma Date em pt-BR longo com dia da semana", () => {
        // 1 de janeiro de 2024 = segunda-feira
        const date = new Date(2024, 0, 1);
        const result = formatDate(date);
        expect(result).toMatch(/segunda/i);
        expect(result).toMatch(/janeiro/i);
        expect(result).toMatch(/2024/);
    });

    it("formata uma string ISO corretamente", () => {
        const result = formatDate("2024-06-15T12:00:00.000Z");
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
    });

    it("contém o número do dia no resultado", () => {
        const date = new Date(2024, 0, 15);
        const result = formatDate(date);
        expect(result).toContain("15");
    });

    it("contém o ano no resultado", () => {
        const date = new Date(2023, 5, 10);
        const result = formatDate(date);
        expect(result).toContain("2023");
    });

    it("retorna string diferente para datas distintas", () => {
        const r1 = formatDate(new Date(2024, 0, 1));
        const r2 = formatDate(new Date(2024, 6, 1));
        expect(r1).not.toBe(r2);
    });
});

// ─── formatShortDate ──────────────────────────────────────────────────────────

describe("formatShortDate", () => {
    it("formata em pt-BR curto com dia numérico e mês abreviado", () => {
        const date = new Date(2024, 0, 1);
        const result = formatShortDate(date);
        // Deve conter "1" e alguma abreviação de janeiro (jan.)
        expect(result).toMatch(/1/);
        expect(result).toMatch(/jan/i);
    });

    it("aceita string ISO", () => {
        const result = formatShortDate("2024-03-20T00:00:00.000Z");
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
    });

    it("não inclui o ano", () => {
        const result = formatShortDate(new Date(2024, 0, 1));
        expect(result).not.toContain("2024");
    });

    it("resultados de meses diferentes são distintos", () => {
        const jan = formatShortDate(new Date(2024, 0, 1));
        const jun = formatShortDate(new Date(2024, 5, 1));
        expect(jan).not.toBe(jun);
    });
});

// ─── truncate ─────────────────────────────────────────────────────────────────

describe("truncate", () => {
    it("retorna a string original quando menor que o limite", () => {
        expect(truncate("olá", 10)).toBe("olá");
    });

    it("retorna a string original quando igual ao limite (sem truncar)", () => {
        expect(truncate("abcde", 5)).toBe("abcde");
    });

    it("trunca e adiciona reticências quando maior que o limite", () => {
        expect(truncate("abcdefghij", 5)).toBe("abcde…");
    });

    it("com length=0 retorna apenas '…'", () => {
        expect(truncate("qualquer coisa", 0)).toBe("…");
    });

    it("com string vazia retorna string vazia independente do length", () => {
        expect(truncate("", 10)).toBe("");
        expect(truncate("", 0)).toBe("");
    });

    it("usa reticências unicode (…) e não três pontos (...)", () => {
        const result = truncate("abcdefgh", 3);
        expect(result).toBe("abc…");
        expect(result).not.toContain("...");
    });

    it("trunca em limite exato de 1 caractere", () => {
        expect(truncate("abc", 1)).toBe("a…");
    });
});

// ─── sleep ────────────────────────────────────────────────────────────────────

describe("sleep", () => {
    it("retorna uma Promise", () => {
        const result = sleep(0);
        expect(result).toBeInstanceOf(Promise);
        return result;
    });

    it("sleep(0) resolve sem rejeitar", async () => {
        await expect(sleep(0)).resolves.toBeUndefined();
    });

    it("sleep(0) resolve rapidamente (menos de 100ms)", async () => {
        const start = Date.now();
        await sleep(0);
        const elapsed = Date.now() - start;
        expect(elapsed).toBeLessThan(100);
    });

    it("sleep com valor positivo resolve sem rejeitar", async () => {
        await expect(sleep(10)).resolves.toBeUndefined();
    });

    it("resolve em undefined (sem valor de retorno)", async () => {
        const result = await sleep(0);
        expect(result).toBeUndefined();
    });
});
