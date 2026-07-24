import { genai } from "@/lib/gemini/client";
import type { EmotionAnalysis } from "@/types";

export async function analyzeEmotion(emotionRaw: string): Promise<EmotionAnalysis> {
    const model = genai.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: `Você é um pastor experiente e conselheiro espiritual com profundo conhecimento bíblico.
Analise a emoção/sentimento descrito pelo usuário e retorne um JSON com a análise espiritual.

PRIMEIRO, decida se o texto expressa um SENTIMENTO ou estado emocional/espiritual GENUÍNO de uma pessoa.
Marque "detected": false quando NÃO houver sentimento real — por exemplo: uma pergunta aleatória
("qual a capital da França?"), um comando/pedido genérico, spam, propaganda, texto sem sentido
ou de teste ("asdf", "teste 123", "aaaa"), ou algo totalmente fora do contexto de emoções/fé.
Caso contrário, "detected": true.

Retorne SOMENTE um JSON válido com esta estrutura:
{
  "detected": true | false,
  "primary_emotion": "nome da emoção principal em português (use \"\" se detected=false)",
  "intensity": "low" | "medium" | "high",
  "spiritual_context": "contexto espiritual desta emoção em 1-2 frases",
  "biblical_themes": ["tema1", "tema2", "tema3"],
  "recommended_tone": "tom recomendado para o devocional (ex: acolhedor, encorajador, confrontador com amor, contemplativo)"
}`,
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3,
            // @ts-expect-error thinkingConfig não está nos tipos do SDK ainda
            thinkingConfig: { thinkingBudget: 0 },
        },
    });

    const result = await model.generateContent(
        `O usuário está sentindo: "${emotionRaw}"`
    );

    const text = result.response.text();
    if (!text) throw new Error("Resposta vazia da IA");

    return JSON.parse(text) as EmotionAnalysis;
}

export async function generateDevotional(
    emotionRaw: string,
    analysis: EmotionAnalysis,
    userName?: string | null,
    forbiddenReferences: string[] = [],
    recentTitles: string[] = []
): Promise<string> {
    const name = userName ? `, ${userName}` : "";
    const themesText = analysis.biblical_themes.join(", ");

    const systemPrompt = `Você é um pastor bíblico maduro, sensível e sábio com décadas de experiência pastoral.
Você escreve devocionais profundos, pessoais e biblicamente fundamentados.

REGRAS ABSOLUTAS:
- NUNCA seja genérico ou superficial
- NUNCA soe como coach motivacional ou frases de autoajuda
- NUNCA repita estruturas previsíveis ou linguagem vazia
- NUNCA repita um versículo que o usuário já recebeu (a mensagem trará a lista de proibidos)
- NUNCA recorra sempre ao mesmo versículo "clichê" de cada emoção — as Escrituras são vastas; escolha passagens variadas e menos óbvias sobre o tema
- SEMPRE adapte o tom ao estado emocional específico
- SEMPRE use base bíblica consistente e precisa
- SEMPRE crie sensação de conversa pessoal e pastoral
- SEMPRE seja profundo, acolhedor e humano

REGRAS DE TÍTULO (é o campo que mais cai em repetição — cuide dele):
- 3 a 6 palavras. Linguagem humana, concreta e direta; nada de rebuscado.
- É PROIBIDO começar com "Quando", "No silêncio", "O peso", "Entre", "A alma" ou "O clamor".
- Evite o vocabulário poético batido: "alma que clama", "abismo", "véu", "norte perdido",
  "travessia", "eco", "labirinto".
- VARIE A FORMA de um devocional para o outro — não use sempre o mesmo molde:
  • uma verdade curta — "Você não caminha sozinho"
  • uma promessa — "Ele vai à sua frente"
  • um convite — "Descanse por hoje"
  • algo concreto do dia — "Uma oração para a manhã difícil"

Tom recomendado: ${analysis.recommended_tone}
Intensidade emocional: ${analysis.intensity}
Contexto espiritual: ${analysis.spiritual_context}
Temas bíblicos: ${themesText}

Retorne um JSON com esta estrutura exata:
{
  "title": "3 a 6 palavras, seguindo as REGRAS DE TÍTULO acima",
  "verse": "texto completo do versículo em português",
  "verse_reference": "Livro Capítulo:Versículo",
  "reflection": "reflexão espiritual profunda e personalizada (3-4 parágrafos ricos, pastorais, que toquem o coração)",
  "practical_application": "aplicação prática no dia de hoje (2 parágrafos concretos)",
  "prayer": "oração personalizada na primeira pessoa (íntima, honesta, profunda - 2-3 parágrafos)",
  "declaration": "declaração de fé forte e bíblica (1-2 frases poderosas)",
  "reflective_question": "pergunta reflexiva que provoque introspecção genuína"
}`;

    const forbiddenBlock = forbiddenReferences.length > 0
        ? `\n\nVERSÍCULOS JÁ USADOS POR ESTE USUÁRIO (PROIBIDOS — não repita NENHUM; escolha uma passagem diferente e menos óbvia sobre o tema):\n${forbiddenReferences.map((r) => `- ${r}`).join("\n")}`
        : "";

    const titlesBlock = recentTitles.length > 0
        ? `\n\nTÍTULOS RECENTES DESTE USUÁRIO — não repita nenhum e, principalmente, NÃO use a mesma estrutura/molde deles. Se todos seguem um padrão parecido, use uma forma claramente diferente:\n${recentTitles.map((t) => `- ${t}`).join("\n")}`
        : "";

    const userMessage = `${userName ? `Usuário: ${userName}` : ""}
Estado emocional: "${emotionRaw}"
Emoção principal: ${analysis.primary_emotion}

Crie um devocional profundamente personalizado e único para este momento.${forbiddenBlock}${titlesBlock}`;

    const model = genai.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: systemPrompt,
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.85,
            maxOutputTokens: 8192,
            // @ts-expect-error thinkingConfig não está nos tipos do SDK ainda
            thinkingConfig: { thinkingBudget: 0 },
        },
    });

    const result = await model.generateContent(userMessage);
    const text = result.response.text();
    if (!text) throw new Error("Resposta vazia da IA");

    return text;
}
