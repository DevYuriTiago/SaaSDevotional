// PATH: src/__tests__/unit/app-url.test.ts

import { appUrl } from "@/lib/app-url";

describe("appUrl", () => {
    const original = process.env.NEXT_PUBLIC_APP_URL;
    afterEach(() => { process.env.NEXT_PUBLIC_APP_URL = original; });

    it("usa o domínio configurado quando é válido", () => {
        process.env.NEXT_PUBLIC_APP_URL = "https://humanah.app";
        expect(appUrl()).toBe("https://humanah.app");
    });

    it("descarta valor de placeholder sem ponto no domínio", () => {
        // O bug real em produção: a variável estava como "https://temp" e todos
        // os links do embaixador saíam como https://temp/e/slug.
        process.env.NEXT_PUBLIC_APP_URL = "https://temp";
        expect(appUrl()).toBe("https://humanah.app");
    });

    it("descarta valor vazio ou lixo não parseável", () => {
        for (const v of ["", "   ", "nao-e-url", "://quebrado"]) {
            process.env.NEXT_PUBLIC_APP_URL = v;
            expect(appUrl()).toBe("https://humanah.app");
        }
    });

    it("aceita endereços locais de desenvolvimento", () => {
        process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
        expect(appUrl()).toBe("http://localhost:3000");
    });

    it("remove a barra final para não gerar caminho com barra dupla", () => {
        process.env.NEXT_PUBLIC_APP_URL = "https://humanah.app/";
        expect(`${appUrl()}/e/joao`).toBe("https://humanah.app/e/joao");
    });

    it("sem a variável definida, cai no domínio de produção", () => {
        delete process.env.NEXT_PUBLIC_APP_URL;
        expect(appUrl()).toBe("https://humanah.app");
    });
});
