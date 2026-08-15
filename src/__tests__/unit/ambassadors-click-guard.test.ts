// PATH: src/__tests__/unit/ambassadors-click-guard.test.ts

import { assessClick } from "@/lib/ambassadors/click-guard";

describe("assessClick", () => {
    describe("navegação legítima", () => {
        it("clique real de topo conta e grava o cookie", () => {
            const r = assessClick({ secFetchDest: "document", hasRecentClick: false });
            expect(r).toEqual({ countClick: true, setCookie: true, reason: null });
        });

        it("navegador antigo sem o cabeçalho não é punido", () => {
            // Preferimos deixar passar um ataque raro a quebrar a atribuição de
            // um usuário real cujo navegador não envia Sec-Fetch-Dest.
            const r = assessClick({ secFetchDest: null, hasRecentClick: false });
            expect(r.setCookie).toBe(true);
            expect(r.countClick).toBe(true);
        });
    });

    describe("cookie stuffing", () => {
        it.each(["iframe", "image", "script", "empty", "object", "embed"])(
            "carregamento invisível como %s não grava cookie nem conta",
            (dest) => {
                const r = assessClick({ secFetchDest: dest, hasRecentClick: false });
                expect(r.setCookie).toBe(false);
                expect(r.countClick).toBe(false);
                expect(r.reason).toBe("carregamento invisivel");
            }
        );

        it("bloqueio vale mesmo sem clique recente do mesmo IP", () => {
            expect(assessClick({ secFetchDest: "iframe", hasRecentClick: false }).setCookie).toBe(false);
        });
    });

    describe("clique repetido", () => {
        it("não conta na métrica, mas continua gravando o cookie", () => {
            // Recarregar a página é comportamento normal, não fraude: a
            // atribuição precisa continuar funcionando.
            const r = assessClick({ secFetchDest: "document", hasRecentClick: true });
            expect(r.countClick).toBe(false);
            expect(r.setCookie).toBe(true);
            expect(r.reason).toBe("clique repetido");
        });
    });

    describe("precedência", () => {
        it("carregamento invisível prevalece sobre clique repetido", () => {
            const r = assessClick({ secFetchDest: "iframe", hasRecentClick: true });
            expect(r.setCookie).toBe(false);
            expect(r.reason).toBe("carregamento invisivel");
        });
    });
});
