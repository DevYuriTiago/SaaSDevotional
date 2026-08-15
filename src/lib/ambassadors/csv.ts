/**
 * CSV agregado dos embaixadores, para o admin.
 *
 * LGPD: só números por embaixador. Nunca a lista de usuários que se
 * cadastraram, nem qualquer identificação de quem assinou.
 */

export type CsvRow = {
    name: string;
    status: string;
    slug: string | null;
    clicks: number;
    signups: number;
    payingCount: number;
    grossTotalCents: number;
    commissionCents: number;
};

const HEADER = [
    "nome", "situacao", "link", "cliques", "cadastros",
    "assinantes", "receita_gerada", "comissao",
];

/** Reais com vírgula decimal, que é o que o Excel em português espera. */
function reais(cents: number): string {
    return (cents / 100).toFixed(2).replace(".", ",");
}

/** Envolve em aspas e dobra as aspas internas quando necessário. */
function escape(value: string | number): string {
    const s = String(value);
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function buildCsv(rows: CsvRow[]): string {
    const linhas = rows.map((r) =>
        [
            r.name,
            r.status,
            r.slug ?? "",
            r.clicks,
            r.signups,
            r.payingCount,
            reais(r.grossTotalCents),
            reais(r.commissionCents),
        ].map(escape).join(",")
    );
    return [HEADER.join(","), ...linhas].join("\n") + "\n";
}
