// =============================================================================
// Cânon bíblico (66 livros) — verificação programática de referências.
//
// Objetivo: pegar referências inventadas pela IA (ex.: "Salmos 200:1",
// "Hesitações 3:4") de forma barata e determinística, ANTES de exibir ao
// usuário. Valida: livro existe, capítulo dentro da contagem do livro, e
// versículo > 0. NÃO valida se o TEXTO do versículo bate com a referência
// (isso exigiria um dataset bíblico completo — ver roadmap).
// =============================================================================

interface CanonBook {
    canonical: string;
    chapters: number;
    aliases: string[];
}

// chapters = número de capítulos do livro (cânon protestante).
const BOOKS: CanonBook[] = [
    { canonical: "Gênesis", chapters: 50, aliases: ["genesis", "gn", "gen"] },
    { canonical: "Êxodo", chapters: 40, aliases: ["exodo", "ex", "exo"] },
    { canonical: "Levítico", chapters: 27, aliases: ["levitico", "lv", "lev"] },
    { canonical: "Números", chapters: 36, aliases: ["numeros", "nm", "num"] },
    { canonical: "Deuteronômio", chapters: 34, aliases: ["deuteronomio", "dt", "deut"] },
    { canonical: "Josué", chapters: 24, aliases: ["josue", "js", "jos"] },
    { canonical: "Juízes", chapters: 21, aliases: ["juizes", "jz", "juiz"] },
    { canonical: "Rute", chapters: 4, aliases: ["rute", "rt"] },
    { canonical: "1 Samuel", chapters: 31, aliases: ["1 samuel", "1samuel", "1sm", "i samuel", "primeiro samuel"] },
    { canonical: "2 Samuel", chapters: 24, aliases: ["2 samuel", "2samuel", "2sm", "ii samuel", "segundo samuel"] },
    { canonical: "1 Reis", chapters: 22, aliases: ["1 reis", "1reis", "1rs", "i reis", "primeiro reis"] },
    { canonical: "2 Reis", chapters: 25, aliases: ["2 reis", "2reis", "2rs", "ii reis", "segundo reis"] },
    { canonical: "1 Crônicas", chapters: 29, aliases: ["1 cronicas", "1cronicas", "1cr", "i cronicas"] },
    { canonical: "2 Crônicas", chapters: 36, aliases: ["2 cronicas", "2cronicas", "2cr", "ii cronicas"] },
    { canonical: "Esdras", chapters: 10, aliases: ["esdras", "ed"] },
    { canonical: "Neemias", chapters: 13, aliases: ["neemias", "ne"] },
    { canonical: "Ester", chapters: 10, aliases: ["ester", "et"] },
    { canonical: "Jó", chapters: 42, aliases: ["jo", "job"] },
    { canonical: "Salmos", chapters: 150, aliases: ["salmos", "salmo", "sl", "sal"] },
    { canonical: "Provérbios", chapters: 31, aliases: ["proverbios", "pv", "prov"] },
    { canonical: "Eclesiastes", chapters: 12, aliases: ["eclesiastes", "ec", "ecle"] },
    { canonical: "Cânticos", chapters: 8, aliases: ["canticos", "cantares", "cantico dos canticos", "cantares de salomao", "ct"] },
    { canonical: "Isaías", chapters: 66, aliases: ["isaias", "is"] },
    { canonical: "Jeremias", chapters: 52, aliases: ["jeremias", "jr", "jer"] },
    { canonical: "Lamentações", chapters: 5, aliases: ["lamentacoes", "lm", "lam"] },
    { canonical: "Ezequiel", chapters: 48, aliases: ["ezequiel", "ez"] },
    { canonical: "Daniel", chapters: 12, aliases: ["daniel", "dn", "dan"] },
    { canonical: "Oseias", chapters: 14, aliases: ["oseias", "os"] },
    { canonical: "Joel", chapters: 3, aliases: ["joel", "jl"] },
    { canonical: "Amós", chapters: 9, aliases: ["amos", "am"] },
    { canonical: "Obadias", chapters: 1, aliases: ["obadias", "ob"] },
    { canonical: "Jonas", chapters: 4, aliases: ["jonas", "jn"] },
    { canonical: "Miqueias", chapters: 7, aliases: ["miqueias", "mq", "miq"] },
    { canonical: "Naum", chapters: 3, aliases: ["naum", "na"] },
    { canonical: "Habacuque", chapters: 3, aliases: ["habacuque", "hc", "hab"] },
    { canonical: "Sofonias", chapters: 3, aliases: ["sofonias", "sf"] },
    { canonical: "Ageu", chapters: 2, aliases: ["ageu", "ag"] },
    { canonical: "Zacarias", chapters: 14, aliases: ["zacarias", "zc", "zac"] },
    { canonical: "Malaquias", chapters: 4, aliases: ["malaquias", "ml", "mal"] },
    { canonical: "Mateus", chapters: 28, aliases: ["mateus", "mt", "mat"] },
    { canonical: "Marcos", chapters: 16, aliases: ["marcos", "mc", "mar"] },
    { canonical: "Lucas", chapters: 24, aliases: ["lucas", "lc", "luc"] },
    { canonical: "João", chapters: 21, aliases: ["joao", "jo", "joa"] },
    { canonical: "Atos", chapters: 28, aliases: ["atos", "at", "atos dos apostolos"] },
    { canonical: "Romanos", chapters: 16, aliases: ["romanos", "rm", "rom"] },
    { canonical: "1 Coríntios", chapters: 16, aliases: ["1 corintios", "1corintios", "1co", "i corintios", "primeira corintios"] },
    { canonical: "2 Coríntios", chapters: 13, aliases: ["2 corintios", "2corintios", "2co", "ii corintios"] },
    { canonical: "Gálatas", chapters: 6, aliases: ["galatas", "gl", "gal"] },
    { canonical: "Efésios", chapters: 6, aliases: ["efesios", "ef"] },
    { canonical: "Filipenses", chapters: 4, aliases: ["filipenses", "fp", "fil"] },
    { canonical: "Colossenses", chapters: 4, aliases: ["colossenses", "cl", "col"] },
    { canonical: "1 Tessalonicenses", chapters: 5, aliases: ["1 tessalonicenses", "1tessalonicenses", "1ts", "i tessalonicenses"] },
    { canonical: "2 Tessalonicenses", chapters: 3, aliases: ["2 tessalonicenses", "2tessalonicenses", "2ts", "ii tessalonicenses"] },
    { canonical: "1 Timóteo", chapters: 6, aliases: ["1 timoteo", "1timoteo", "1tm", "i timoteo"] },
    { canonical: "2 Timóteo", chapters: 4, aliases: ["2 timoteo", "2timoteo", "2tm", "ii timoteo"] },
    { canonical: "Tito", chapters: 3, aliases: ["tito", "tt"] },
    { canonical: "Filemom", chapters: 1, aliases: ["filemom", "fm", "filemon"] },
    { canonical: "Hebreus", chapters: 13, aliases: ["hebreus", "hb", "heb"] },
    { canonical: "Tiago", chapters: 5, aliases: ["tiago", "tg"] },
    { canonical: "1 Pedro", chapters: 5, aliases: ["1 pedro", "1pedro", "1pe", "i pedro"] },
    { canonical: "2 Pedro", chapters: 3, aliases: ["2 pedro", "2pedro", "2pe", "ii pedro"] },
    { canonical: "1 João", chapters: 5, aliases: ["1 joao", "1joao", "1jo", "i joao"] },
    { canonical: "2 João", chapters: 1, aliases: ["2 joao", "2joao", "2jo", "ii joao"] },
    { canonical: "3 João", chapters: 1, aliases: ["3 joao", "3joao", "3jo", "iii joao"] },
    { canonical: "Judas", chapters: 1, aliases: ["judas", "jd"] },
    { canonical: "Apocalipse", chapters: 22, aliases: ["apocalipse", "ap", "apoc", "revelacao"] },
];

// Remove acentos, baixa caixa, normaliza ordinais (I/II/III, 1ª/1º) e espaços.
function normalize(raw: string): string {
    let s = raw
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "") // remove marcas diacríticas combinantes
        .toLowerCase()
        .replace(/[.ºª]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    // Ordinais romanos no início → arábicos
    s = s.replace(/^iii\s+/, "3 ").replace(/^ii\s+/, "2 ").replace(/^i\s+/, "1 ");
    // "primeira/segunda/terceira" → 1/2/3
    s = s
        .replace(/^primeir[ao]\s+/, "1 ")
        .replace(/^segund[ao]\s+/, "2 ")
        .replace(/^terceir[ao]\s+/, "3 ");
    return s;
}

const LOOKUP: Map<string, CanonBook> = (() => {
    const m = new Map<string, CanonBook>();
    for (const b of BOOKS) {
        m.set(normalize(b.canonical), b);
        for (const a of b.aliases) m.set(normalize(a), b);
    }
    return m;
})();

export interface ParsedReference {
    book: CanonBook;
    chapter: number;
    verse: number | null;
}

/**
 * Faz parse de uma referência tipo "Filipenses 4:6", "1 Coríntios 13:4-7",
 * "Salmo 23". Retorna null se não reconhecer o livro ou o formato.
 */
export function parseReference(ref: string): ParsedReference | null {
    if (!ref || typeof ref !== "string") return null;
    // Captura: <livro> <capítulo>[:<versículo>[-<fim>]]
    const m = ref.trim().match(/^(.+?)\s+(\d+)(?::(\d+))?(?:\s*[-–]\s*\d+)?$/);
    if (!m) return null;

    const book = LOOKUP.get(normalize(m[1]));
    if (!book) return null;

    return {
        book,
        chapter: parseInt(m[2], 10),
        verse: m[3] ? parseInt(m[3], 10) : null,
    };
}

export interface VerseValidation {
    valid: boolean;
    reason?: string;
}

/**
 * Valida uma referência contra o cânon: livro real, capítulo dentro da
 * contagem do livro e versículo positivo.
 */
export function validateReference(ref: string): VerseValidation {
    const parsed = parseReference(ref);
    if (!parsed) return { valid: false, reason: "formato ou livro não reconhecido" };

    if (parsed.chapter < 1 || parsed.chapter > parsed.book.chapters) {
        return {
            valid: false,
            reason: `${parsed.book.canonical} tem ${parsed.book.chapters} capítulos (recebido ${parsed.chapter})`,
        };
    }
    if (parsed.verse !== null && parsed.verse < 1) {
        return { valid: false, reason: "versículo inválido" };
    }
    return { valid: true };
}
