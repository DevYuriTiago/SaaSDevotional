import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { genai } from "@/lib/gemini/client";
import { JOURNEY_THEMES, FREE_JOURNEY_DAY_LIMIT } from "@/lib/constants";
import { isPremium } from "@/lib/premium";
import { aiErrorResponse } from "@/lib/ai/errors";

const isMaster = process.env.MASTER_MODE === "true";

interface PlanVerse { day: number; reference: string; text: string; theme: string; }

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_tier, premium_until, name")
        .eq("id", user.id)
        .single();

    const userIsPremium = isPremium(profile);

    const body = await request.json() as { slug: string; day: number; plan_id: string };
    const { slug, day, plan_id } = body;

    if (!slug || !day || day < 1 || day > 21 || !plan_id) {
        return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
    }

    // Free percorre só os 7 primeiros dias da jornada; do 8º em diante é Premium.
    if (!isMaster && !userIsPremium && day > FREE_JOURNEY_DAY_LIMIT) {
        return NextResponse.json({ error: "premium_required" }, { status: 402 });
    }

    const theme = JOURNEY_THEMES.find((t) => t.slug === slug);
    if (!theme) return NextResponse.json({ error: "Jornada não encontrada" }, { status: 404 });

    // 1. Cache: já foi gerado?
    const { data: cached } = await supabase
        .from("journey_days")
        .select("content")
        .eq("user_id", user.id)
        .eq("slug", slug)
        .eq("day", day)
        .maybeSingle();

    if (cached) return NextResponse.json({ devotional: cached.content, cached: true });

    // 2. Verificar trava de dia
    if (day > 1) {
        const { data: prevDay } = await supabase
            .from("journey_days")
            .select("generated_at")
            .eq("user_id", user.id)
            .eq("slug", slug)
            .eq("day", day - 1)
            .maybeSingle();

        if (!prevDay) {
            return NextResponse.json({ error: "Complete o dia anterior primeiro." }, { status: 403 });
        }

        if (!isMaster) {
            const prevDate = new Date(prevDay.generated_at).toISOString().slice(0, 10);
            const today = new Date().toISOString().slice(0, 10);
            if (prevDate >= today) {
                return NextResponse.json(
                    { error: "day_locked", message: "Este dia estará disponível amanhã. Volte para continuar sua jornada! 🌙" },
                    { status: 403 },
                );
            }
        }
    }

    // 3. Buscar versículo do plano
    const { data: plan } = await supabase
        .from("journey_plans")
        .select("verses")
        .eq("id", plan_id)
        .eq("user_id", user.id)
        .single();

    if (!plan) return NextResponse.json({ error: "Plano não encontrado." }, { status: 404 });

    const verses = plan.verses as PlanVerse[];
    const verseData = verses.find((v) => v.day === day);
    if (!verseData) return NextResponse.json({ error: "Versículo do dia não encontrado." }, { status: 500 });

    const name = profile?.name ?? "Amigo";
    const depth =
        day <= 7 ? "introdutório — fundamentos básicos" :
            day <= 14 ? "intermediário — aprofundamento e prática" :
                "avançado — maturidade espiritual e transformação";

    // 4. Gerar conteúdo com IA
    const model = genai.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: `Você é um pastor experiente criando o Dia ${day} de 21 da jornada "${theme.label}".
O versículo-base deste dia é FIXO e não pode ser alterado: ${verseData.reference} — "${verseData.text}"
Foco espiritual: "${verseData.theme}"
Nível de profundidade: ${depth}
Retorne SOMENTE JSON válido:
{
  "title": "título único e evocativo para o Dia ${day} (baseado no foco: ${verseData.theme})",
  "verse": "${verseData.text}",
  "verse_reference": "${verseData.reference}",
  "reflection": "reflexão profunda e progressiva sobre o versículo (3 parágrafos separados por \\n\\n)",
  "practical_application": "aplicação prática concreta para hoje (2 parágrafos separados por \\n\\n)",
  "prayer": "oração personalizada na primeira pessoa baseada no versículo (2 parágrafos separados por \\n\\n)",
  "declaration": "declaração de fé forte baseada no versículo (1-2 frases)",
  "reflective_question": "pergunta reflexiva genuína sobre o versículo"
}`,
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.72,
            maxOutputTokens: 8192,
            // @ts-expect-error thinkingConfig não está nos tipos do SDK ainda
            thinkingConfig: { thinkingBudget: 0 },
        },
    });

    let content;
    try {
        const result = await model.generateContent(
            `Nome: ${name}\nJornada: ${theme.label}\nDia ${day} de 21\nFoco: ${verseData.theme}\nVersículo: ${verseData.reference} — "${verseData.text}"`
        );
        content = JSON.parse(result.response.text());
    } catch (err) {
        return aiErrorResponse(err, { subject: "seu devocional" });
    }

    // 5. Salvar em journey_days
    const { data: saved } = await supabase
        .from("journey_days")
        .insert({ plan_id, user_id: user.id, slug, day, content })
        .select("content")
        .single();

    return NextResponse.json({ devotional: saved?.content ?? content, cached: false });
}
