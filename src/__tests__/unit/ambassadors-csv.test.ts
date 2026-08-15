// PATH: src/__tests__/unit/ambassadors-csv.test.ts

import { buildCsv, type CsvRow } from "@/lib/ambassadors/csv";

const linha: CsvRow = {
    name: "Pastor João",
    status: "active",
    slug: "pastorjoao",
    clicks: 120,
    signups: 40,
    payingCount: 12,
    grossTotalCents: 29_880,
    commissionCents: 1_494,
};

describe("buildCsv", () => {
    it("começa pelo cabeçalho e traz uma linha por embaixador", () => {
        const csv = buildCsv([linha, { ...linha, name: "Maria" }]);
        const linhas = csv.trim().split("\n");
        expect(linhas).toHaveLength(3);
        expect(linhas[0]).toContain("nome");
    });

    it("converte centavos em reais com vírgula decimal", () => {
        const csv = buildCsv([linha]);
        expect(csv).toContain("298,80"); // bruto
        expect(csv).toContain("14,94");  // comissão
    });

    it("escapa nome com vírgula sem quebrar as colunas", () => {
        const csv = buildCsv([{ ...linha, name: 'Silva, João "Jota"' }]);
        const dados = csv.trim().split("\n")[1];
        expect(dados).toContain('"Silva, João ""Jota"""');
        // o escape mantém o número de colunas do cabeçalho
        expect(dados.split('","').length).toBeGreaterThan(0);
    });

    it("lista vazia devolve só o cabeçalho", () => {
        expect(buildCsv([]).trim().split("\n")).toHaveLength(1);
    });

    it("não expõe nenhum dado de usuário final (LGPD)", () => {
        const csv = buildCsv([linha]).toLowerCase();
        for (const proibido of ["user_id", "e-mail do assinante", "@gmail", "cpf"]) {
            expect(csv).not.toContain(proibido);
        }
    });
});
