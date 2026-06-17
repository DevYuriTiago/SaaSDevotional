// =============================================================================
// Páginas SEO programáticas: "versículos para <tema>".
// Conteúdo curado (versículos reais) + intenção de busca de alta conversão.
// Cada tema vira uma página estática indexável com CTA de cadastro.
// =============================================================================

export interface ThemeVerse {
    reference: string;
    text: string;
}

export interface VerseTheme {
    slug: string;
    /** Tema curto (ex.: "ansiedade") usado em títulos e na emoção do CTA. */
    keyword: string;
    h1: string;
    title: string; // <title> / OG
    metaDescription: string;
    intro: string;
    verses: ThemeVerse[];
}

export const VERSE_THEMES: VerseTheme[] = [
    {
        slug: "ansiedade",
        keyword: "ansiedade",
        h1: "Versículos para a ansiedade",
        title: "Versículos para a Ansiedade — A Paz de Deus | Sentindo Hoje",
        metaDescription:
            "Versículos bíblicos para acalmar a ansiedade e encontrar a paz de Deus. Reflexões e uma palavra feita para o que você está sentindo hoje.",
        intro:
            "A ansiedade rouba o presente com medos do futuro. A Palavra de Deus nos chama, de novo e de novo, a entregar o que não conseguimos controlar e a descansar no cuidado dEle. Estes versículos são âncoras para os dias inquietos.",
        verses: [
            { reference: "Filipenses 4:6", text: "Não andeis ansiosos por coisa alguma; antes, em tudo, sejam os vossos pedidos conhecidos diante de Deus pela oração e súplica, com ações de graças." },
            { reference: "1 Pedro 5:7", text: "Lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós." },
            { reference: "Mateus 6:34", text: "Não vos inquieteis, pois, pelo dia de amanhã, porque o dia de amanhã cuidará de si mesmo. Basta a cada dia o seu mal." },
            { reference: "Salmos 55:22", text: "Lança o teu cuidado sobre o Senhor, e ele te susterá; nunca permitirá que o justo seja abalado." },
            { reference: "João 14:27", text: "Deixo-vos a paz, a minha paz vos dou; não vo-la dou como o mundo a dá. Não se turbe o vosso coração, nem se atemorize." },
        ],
    },
    {
        slug: "medo",
        keyword: "medo",
        h1: "Versículos para o medo",
        title: "Versículos para o Medo — Coragem em Deus | Sentindo Hoje",
        metaDescription:
            "Versículos bíblicos para vencer o medo e encontrar coragem em Deus. Uma palavra de fé para fortalecer o seu coração hoje.",
        intro:
            "O medo aperta o peito e encolhe a fé. Mas a Escritura repete o convite de Deus: 'não temas'. Não porque o perigo não exista, mas porque Ele está com você. Estes versículos devolvem a coragem que vem de saber-se acompanhado.",
        verses: [
            { reference: "Isaías 41:10", text: "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus; eu te fortaleço, e te ajudo, e te sustento com a destra da minha justiça." },
            { reference: "2 Timóteo 1:7", text: "Porque Deus não nos deu o espírito de temor, mas de fortaleza, e de amor, e de moderação." },
            { reference: "Salmos 23:4", text: "Ainda que eu andasse pelo vale da sombra da morte, não temeria mal algum, porque tu estás comigo." },
            { reference: "Josué 1:9", text: "Não to mandei eu? Esforça-te, e tem bom ânimo; não temas, nem te espantes, porque o Senhor, teu Deus, é contigo por onde quer que andares." },
            { reference: "Salmos 27:1", text: "O Senhor é a minha luz e a minha salvação; a quem temerei? O Senhor é a força da minha vida; de quem me recearei?" },
        ],
    },
    {
        slug: "tristeza",
        keyword: "tristeza",
        h1: "Versículos para a tristeza",
        title: "Versículos para a Tristeza — Consolo de Deus | Sentindo Hoje",
        metaDescription:
            "Versículos bíblicos de consolo para momentos de tristeza e dor. Deus está perto dos que têm o coração quebrantado.",
        intro:
            "Há dias em que a alma pesa. A Bíblia não pede que você finja estar bem — ela mostra um Deus que se aproxima dos quebrantados e promete consolo verdadeiro. Estes versículos são companhia para a travessia.",
        verses: [
            { reference: "Salmos 34:18", text: "Perto está o Senhor dos que têm o coração quebrantado e salva os contritos de espírito." },
            { reference: "Mateus 5:4", text: "Bem-aventurados os que choram, porque eles serão consolados." },
            { reference: "Salmos 30:5", text: "O choro pode durar uma noite, mas a alegria vem pela manhã." },
            { reference: "Salmos 147:3", text: "Sara os quebrantados de coração e liga-lhes as feridas." },
            { reference: "Apocalipse 21:4", text: "E Deus limpará de seus olhos toda a lágrima; e não haverá mais morte, nem pranto, nem clamor, nem dor." },
        ],
    },
    {
        slug: "gratidao",
        keyword: "gratidão",
        h1: "Versículos sobre gratidão",
        title: "Versículos sobre Gratidão — Coração Agradecido | Sentindo Hoje",
        metaDescription:
            "Versículos bíblicos sobre gratidão para cultivar um coração agradecido a Deus em todo tempo.",
        intro:
            "A gratidão muda os olhos com que vemos a vida. Mesmo no pouco, há motivo para louvar — porque a bondade de Deus não depende das circunstâncias. Estes versículos ensinam o coração a dar graças.",
        verses: [
            { reference: "1 Tessalonicenses 5:18", text: "Em tudo dai graças, porque esta é a vontade de Deus em Cristo Jesus para convosco." },
            { reference: "Salmos 100:4", text: "Entrai pelas portas dele com gratidão e em seus átrios com louvor; louvai-o e bendizei o seu nome." },
            { reference: "Colossenses 3:15", text: "E a paz de Deus domine em vossos corações... e sede agradecidos." },
            { reference: "Salmos 107:1", text: "Louvai ao Senhor, porque ele é bom, porque a sua benignidade dura para sempre." },
            { reference: "Filipenses 4:6", text: "Em tudo, sejam os vossos pedidos conhecidos diante de Deus pela oração e súplica, com ações de graças." },
        ],
    },
    {
        slug: "perdao",
        keyword: "perdão",
        h1: "Versículos sobre perdão",
        title: "Versículos sobre Perdão — Graça e Reconciliação | Sentindo Hoje",
        metaDescription:
            "Versículos bíblicos sobre perdão: receber o perdão de Deus e perdoar a quem nos feriu. Liberdade pela graça.",
        intro:
            "Carregar mágoa é carregar um peso que não é nosso para sustentar. Deus, que nos perdoou primeiro, nos convida a perdoar — e a receber o perdão que liberta. Estes versículos abrem caminho para a reconciliação.",
        verses: [
            { reference: "1 João 1:9", text: "Se confessarmos os nossos pecados, ele é fiel e justo para nos perdoar os pecados e nos purificar de toda injustiça." },
            { reference: "Efésios 4:32", text: "Antes, sede uns para com os outros benignos, misericordiosos, perdoando-vos uns aos outros, como também Deus vos perdoou em Cristo." },
            { reference: "Colossenses 3:13", text: "Suportando-vos uns aos outros e perdoando-vos uns aos outros, se alguém tiver queixa contra outro; assim como Cristo vos perdoou, assim fazei vós também." },
            { reference: "Salmos 103:12", text: "Quanto está longe o Oriente do Ocidente, assim afasta de nós as nossas transgressões." },
            { reference: "Mateus 6:14", text: "Porque, se perdoardes aos homens as suas ofensas, também vosso Pai celestial vos perdoará a vós." },
        ],
    },
    {
        slug: "proposito",
        keyword: "propósito",
        h1: "Versículos sobre propósito",
        title: "Versículos sobre Propósito — O Plano de Deus | Sentindo Hoje",
        metaDescription:
            "Versículos bíblicos sobre propósito e direção. Deus tem um plano para a sua vida — descubra o que a Palavra diz.",
        intro:
            "Quando a vida parece sem rumo, a Palavra lembra: você não está aqui por acaso. Deus tece propósito até no que não entendemos. Estes versículos firmam o coração na direção dEle.",
        verses: [
            { reference: "Jeremias 29:11", text: "Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz e não de mal, para vos dar o fim que esperais." },
            { reference: "Romanos 8:28", text: "E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito." },
            { reference: "Provérbios 19:21", text: "Muitos propósitos há no coração do homem, mas o conselho do Senhor permanecerá." },
            { reference: "Efésios 2:10", text: "Porque somos feitura sua, criados em Cristo Jesus para as boas obras, as quais Deus preparou para que andássemos nelas." },
            { reference: "Salmos 138:8", text: "O Senhor aperfeiçoará o que me concerne; a tua benignidade, ó Senhor, dura para sempre." },
        ],
    },
];

export function getVerseTheme(slug: string): VerseTheme | undefined {
    return VERSE_THEMES.find((t) => t.slug === slug);
}
