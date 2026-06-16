
import type { EmotionCategory } from "@/types";

// Cores recoloridas para o mundo "Vigília → Alvorada": tons-joia
// contidos (à luz de vela), usados só como leve tingimento ao
// selecionar. Sem rosa #ec4899, sem vermelho/azul genéricos.
export const EMOTION_CATEGORIES: EmotionCategory[] = [
    {
        id: "ansioso",
        label: "Ansioso",
        emoji: "😰",
        glyph: "storm",
        color: "#6C7BD6",
        description: "Preocupado com o futuro, inquieto, agitado",
        sub_emotions: ["preocupado", "inquieto", "nervoso", "com medo"],
    },
    {
        id: "triste",
        label: "Triste",
        emoji: "😔",
        glyph: "rain",
        color: "#4E7CB5",
        description: "Melancólico, com peso no coração",
        sub_emotions: ["melancólico", "desanimado", "deprimido", "solitário"],
    },
    {
        id: "com-raiva",
        label: "Com Raiva",
        emoji: "😤",
        glyph: "flame",
        color: "#C2453E",
        description: "Frustrado, irritado, magoado",
        sub_emotions: ["frustrado", "irritado", "magoado", "injustiçado"],
    },
    {
        id: "perdido",
        label: "Perdido",
        emoji: "🌫️",
        glyph: "compass",
        color: "#8A7DC8",
        description: "Sem direção, confuso, sem propósito",
        sub_emotions: ["confuso", "sem direção", "sem propósito", "vazio"],
    },
    {
        id: "grato",
        label: "Grato",
        emoji: "🙏",
        glyph: "hands",
        color: "#E0975A",
        description: "Cheio de gratidão, reconhecido",
        sub_emotions: ["agradecido", "alegre", "abençoado", "realizado"],
    },
    {
        id: "esperancoso",
        label: "Esperançoso",
        emoji: "🌅",
        glyph: "sunrise",
        color: "#E6B450",
        description: "Com fé no amanhã, renovado",
        sub_emotions: ["confiante", "animado", "renovado", "em paz"],
    },
    {
        id: "cansado",
        label: "Cansado",
        emoji: "😮‍💨",
        glyph: "rest",
        color: "#7C748F",
        description: "Esgotado, sem forças, sobrecarregado",
        sub_emotions: ["esgotado", "sobrecarregado", "sem energia", "exausto"],
    },
    {
        id: "com-fe",
        label: "Com Fé",
        emoji: "✨",
        glyph: "anchor",
        color: "#C9962E",
        description: "Firme, crente, confiando em Deus",
        sub_emotions: ["firme", "crente", "confiante em Deus", "seguro"],
    },
    {
        id: "arrependido",
        label: "Arrependido",
        emoji: "💔",
        glyph: "heart",
        color: "#B05A6E",
        description: "Sentindo remorso, buscando perdão",
        sub_emotions: ["arrependido", "com remorso", "buscando perdão", "culpado"],
    },
    {
        id: "solitario",
        label: "Solitário",
        emoji: "🌙",
        glyph: "moon",
        color: "#3E5AC8",
        description: "Sentindo-se só, esquecido, abandonado",
        sub_emotions: ["só", "esquecido", "abandonado", "isolado"],
    },
];

// Marcos de constância (streak) — metas curtas que puxam o retorno diário
export const STREAK_MILESTONES: { days: number; label: string }[] = [
    { days: 3, label: "Três dias" },
    { days: 7, label: "Uma semana fiel" },
    { days: 14, label: "Duas semanas" },
    { days: 21, label: "Hábito formado · 21 dias" },
    { days: 30, label: "Um mês de vigília" },
    { days: 60, label: "Dois meses" },
    { days: 100, label: "Cem dias com Deus" },
    { days: 365, label: "Um ano inteiro" },
];

export const FREE_DEVOTIONAL_LIMIT = 1;

export const PREMIUM_PRICE = 24.9;
export const PREMIUM_CURRENCY = "BRL";

export interface JourneyPhase {
    days: string;
    label: string;
    icon: string;
    description: string;
}

export interface JourneyTheme {
    slug: string;
    label: string;
    emoji: string;
    days: number;
    description: string;
    pitch: string;
    solves: string;
    phases: JourneyPhase[];
}

export const JOURNEY_THEMES: JourneyTheme[] = [
    {
        slug: "ansiedade",
        label: "Vencendo a Ansiedade",
        emoji: "🌊",
        days: 21,
        description: "Supere a ansiedade e encontre a paz que excede todo entendimento",
        pitch: "A ansiedade quer roubar sua paz — mas Deus prometeu uma paz que o mundo não pode dar. Esta jornada vai te conduzir, passo a passo, da inquietação ao descanso genuíno.",
        solves: "Ideal para quem sente preocupação constante, medo do futuro ou agitação interior.",
        phases: [
            { days: "Dias 1–7", label: "Fundamentos", icon: "🌱", description: "Entenda as raízes da ansiedade e descubra o que a Palavra diz sobre seu coração inquieto" },
            { days: "Dias 8–14", label: "Aprofundamento", icon: "🔥", description: "Pratique ferramentas espirituais concretas para substituir o medo pela fé ativa" },
            { days: "Dias 15–21", label: "Maturidade", icon: "🕊️", description: "Viva a paz que excede todo entendimento e mantenha a calma mesmo nas tempestades" },
        ],
    },
    {
        slug: "fe",
        label: "Fortalecendo a Fé",
        emoji: "🔥",
        days: 21,
        description: "Aprofunde sua fé com reflexões diárias sobre confiar em Deus",
        pitch: "A fé não é sentimento — é decisão diária. Esta jornada vai fortalecer sua confiança em Deus com textos bíblicos progressivos que transformam a forma como você enxerga a vida.",
        solves: "Ideal para quem sente a fé fraca, dúvidas frequentes ou distância de Deus.",
        phases: [
            { days: "Dias 1–7", label: "Fundamentos", icon: "🌱", description: "Descubra o que é fé verdadeira e por que ela é a base de tudo na vida cristã" },
            { days: "Dias 8–14", label: "Aprofundamento", icon: "🔥", description: "Aprenda a exercitar a fé no dia a dia com exemplos bíblicos poderosos" },
            { days: "Dias 15–21", label: "Maturidade", icon: "⚡", description: "Alcance uma fé inabalável que persiste mesmo diante das maiores adversidades" },
        ],
    },
    {
        slug: "paz-interior",
        label: "Paz Interior",
        emoji: "🕊️",
        days: 21,
        description: "Encontre descanso genuíno para sua alma inquieta",
        pitch: "Você foi criado para viver em paz — não apenas no céu, mas agora, nesta vida. Esta jornada vai te ensinar a encontrar o descanso genuíno que só Deus pode dar.",
        solves: "Ideal para quem se sente esgotado, agitado por dentro ou incapaz de descansar de verdade.",
        phases: [
            { days: "Dias 1–7", label: "Fundamentos", icon: "🌱", description: "Identifique o que pertuba sua paz e receba o convite de Jesus para o descanso" },
            { days: "Dias 8–14", label: "Aprofundamento", icon: "🔥", description: "Cultive hábitos espirituais que constroem uma paz consistente e duradoura" },
            { days: "Dias 15–21", label: "Maturidade", icon: "🌅", description: "Viva a paz como um estado permanente — não dependente das circunstâncias" },
        ],
    },
    {
        slug: "identidade",
        label: "Identidade em Cristo",
        emoji: "👑",
        days: 21,
        description: "Redescubra quem você é e seu valor eterno em Cristo",
        pitch: "O mundo vai te dizer quem você é pela sua aparência, desempenho ou passado. Mas a Bíblia tem uma resposta completamente diferente — e ela muda tudo.",
        solves: "Ideal para quem luta com autoestima, comparação, sentimento de inadequação ou falta de propósito.",
        phases: [
            { days: "Dias 1–7", label: "Fundamentos", icon: "🌱", description: "Descubra quem você era antes de Cristo e a transformação radical que aconteceu" },
            { days: "Dias 8–14", label: "Aprofundamento", icon: "🔥", description: "Internalize verdades bíblicas sobre seu valor, chamado e posição em Cristo" },
            { days: "Dias 15–21", label: "Maturidade", icon: "👑", description: "Viva plenamente sua identidade de filho de Deus em cada área da sua vida" },
        ],
    },
    {
        slug: "proposito",
        label: "Descobrindo o Propósito",
        emoji: "🌟",
        days: 21,
        description: "Descubra o propósito único que Deus tem para sua vida",
        pitch: "Você não está aqui por acidente. Deus tem um plano específico para sua vida — e esta jornada vai te ajudar a descobrí-lo com clareza bíblica e direção espiritual.",
        solves: "Ideal para quem se sente perdido, sem direção, questionando o sentido da própria vida.",
        phases: [
            { days: "Dias 1–7", label: "Fundamentos", icon: "🌱", description: "Entenda o que a Bíblia diz sobre propósito e por que Deus te criou de forma única" },
            { days: "Dias 8–14", label: "Aprofundamento", icon: "🔥", description: "Descubra seus dons, valores e o chamado que Deus colocou em seu coração" },
            { days: "Dias 15–21", label: "Maturidade", icon: "🌟", description: "Alinha toda a sua vida com o propósito eterno de Deus e comece a viver com missão" },
        ],
    },
    {
        slug: "direcao",
        label: "Direção Espiritual",
        emoji: "🧭",
        days: 21,
        description: "Receba sabedoria para as decisões mais importantes da sua vida",
        pitch: "Nas decisões mais difíceis, Deus não abandona — Ele guia. Esta jornada vai te ensinar a ouvir a voz de Deus e tomar decisões com sabedoria, fé e clareza.",
        solves: "Ideal para quem enfrenta decisões importantes, sente confusão sobre o caminho certo ou quer aprender a ouvir Deus.",
        phases: [
            { days: "Dias 1–7", label: "Fundamentos", icon: "🌱", description: "Aprenda como Deus fala e como você pode reconhecer a voz dEle na sua vida" },
            { days: "Dias 8–14", label: "Aprofundamento", icon: "🔥", description: "Desenvolva discernimento espiritual e sabedoria bíblica para situações complexas" },
            { days: "Dias 15–21", label: "Maturidade", icon: "🧭", description: "Tome decisões com confiança plena, sabendo que Deus dirige seus passos" },
        ],
    },
];

export const ACHIEVEMENTS = [
    {
        slug: "first-devotional",
        title: "Primeiro Passo",
        description: "Gerou seu primeiro devocional",
        icon: "🌱",
    },
    {
        slug: "streak-7",
        title: "Uma Semana de Fé",
        description: "7 dias consecutivos",
        icon: "🔥",
    },
    {
        slug: "streak-21",
        title: "Hábito Espiritual",
        description: "21 dias consecutivos",
        icon: "⭐",
    },
    {
        slug: "streak-100",
        title: "Centurião da Fé",
        description: "100 dias consecutivos",
        icon: "👑",
    },
    {
        slug: "journal-10",
        title: "Coração Aberto",
        description: "10 entradas no diário",
        icon: "📖",
    },
    {
        slug: "journey-complete",
        title: "Jornada Completa",
        description: "Completou uma jornada de 21 dias",
        icon: "🏆",
    },
];
