import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { genai } from "@/lib/gemini/client";
import { JOURNEY_THEMES, FREE_JOURNEY_DAY_LIMIT } from "@/lib/constants";
import { validateReference } from "@/lib/bible/canon";
import { logEvent, EVENTS } from "@/lib/analytics/events";
import { isPremium } from "@/lib/premium";
import { aiErrorResponse } from "@/lib/ai/errors";

const isMaster = process.env.MASTER_MODE === "true";

type DayStatus = "completed" | "available" | "available_tomorrow" | "locked" | "premium";

interface CompletedDay { day: number; generated_at: string; }
interface PlanVerse { day: number; reference: string; text: string; theme: string; }

function computeStatus(
    day: number,
    completed: CompletedDay[],
    masterMode: boolean,
    isPremiumUser: boolean,
): DayStatus {
    if (completed.find((d) => d.day === day)) return "completed";

    // Free experimenta os 7 primeiros dias; do 8º em diante é Premium.
    if (!masterMode && !isPremiumUser && day > FREE_JOURNEY_DAY_LIMIT) return "premium";

    if (day === 1) return "available";

    const prev = completed.find((d) => d.day === day - 1);
    if (!prev) return "locked";
    if (masterMode) return "available";

    // Compare calendar dates in UTC (close enough for day-lock logic)
    const prevDate = new Date(prev.generated_at).toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);
    return prevDate < today ? "available" : "available_tomorrow";
}

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_tier, premium_until, name")
        .eq("id", user.id)
        .single();

    // Free agora pode iniciar UMA jornada e percorrer os 7 primeiros dias.
    // O gating dos dias 8–21 acontece por dia (status "premium" + 402 no generate).
    const userIsPremium = isPremium(profile);

    const body = await request.json() as { slug: string };
    const { slug } = body;
    const theme = JOURNEY_THEMES.find((t) => t.slug === slug);
    if (!theme) return NextResponse.json({ error: "Jornada não encontrada" }, { status: 404 });

    // 1. Buscar plano existente (também valida se a tabela existe)
    const { data: existingPlan, error: selectErr } = await supabase
        .from("journey_plans")
        .select("id, verses")
        .eq("user_id", user.id)
        .eq("slug", slug)
        .maybeSingle();

    // Tabela não existe — usuário precisa rodar a migration
    if (selectErr && (selectErr as { code?: string }).code === "42P01") {
        return NextResponse.json(
            { error: "Tabelas de jornada não encontradas. Execute a migration 002_journey_tables.sql no Supabase Dashboard." },
            { status: 503 }
        );
    }

    let plan = existingPlan;

    // 2. Regra: 1 jornada ativa por vez (bypassada em MASTER_MODE)
    if (!plan && !isMaster) {
        const { data: otherPlans } = await supabase
            .from("journey_plans")
            .select("slug, journey_days(count)")
            .eq("user_id", user.id)
            .neq("slug", slug);

        for (const p of otherPlans ?? []) {
            const completed = (p.journey_days as { count: number }[])[0]?.count ?? 0;
            if (completed < 21) {
                return NextResponse.json(
                    { error: "active_journey", active_slug: p.slug },
                    { status: 409 }
                );
            }
        }
    }

    // 3. Criar plano se não existe
    if (!plan) {
        const model = genai.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: `Você é um especialista em teologia bíblica progressiva. Responda APENAS com JSON válido, sem texto adicional.`,
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.6,
                maxOutputTokens: 4096,
                // @ts-expect-error thinkingConfig não está nos tipos do SDK ainda
                thinkingConfig: { thinkingBudget: 0 },
            },
        });

        const planPrompt = `Para o tema "${theme.label}" (${theme.description}), crie um currículo de 21 versículos bíblicos em ordem de progressão espiritual crescente:
- Dias 1-7: fundamentos — conceitos básicos e introdução ao tema (acessível para iniciantes)
- Dias 8-14: aprofundamento — compreensão mais densa e aplicação prática
- Dias 15-21: maturidade espiritual — transformação interior, prática avançada e plenitude

Regras: cada versículo deve ser ÚNICO. Use versículos REAIS da Bíblia em português (NVI ou ARA), com referência correta (livro, capítulo e versículo que existem de fato). O texto deve ser o versículo completo.

Retorne JSON com exatamente 21 itens:
{
  "verses": [
    { "day": 1, "reference": "Livro Cap:Ver", "text": "texto completo em português", "theme": "título do foco (máx 5 palavras)" }
  ]
}`;

        // Gera o plano e valida as referências contra o cânon; regenera uma vez
        // se a IA inventar livros/capítulos inexistentes (anti-alucinação).
        let verses: PlanVerse[] | null = null;
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const result = await model.generateContent(planPrompt);
                const raw = result.response.text().trim();
                const parsed = JSON.parse(raw);
                let v: PlanVerse[] = Array.isArray(parsed) ? parsed : parsed.verses;
                if (!Array.isArray(v) || v.length < 10) throw new Error("Poucas entradas no plano");
                // Garantir que todos os dias estejam numerados corretamente
                v = v.slice(0, 21).map((x, i) => ({ ...x, day: i + 1 }));

                verses = v; // mantém como fallback
                const invalid = v.filter((x) => !validateReference(x.reference).valid);
                if (invalid.length === 0) break;
                console.warn(
                    `[journey/plan] ${invalid.length}/21 referências inválidas (tentativa ${attempt + 1}): ${invalid.map((x) => x.reference).join(", ")}`
                );
            } catch (err) {
                if (attempt === 1 && !verses) {
                    return aiErrorResponse(err, { subject: "sua jornada" });
                }
            }
        }
        if (!verses) {
            return aiErrorResponse(new Error("plan_failed"), { subject: "sua jornada" });
        }

        const { data: newPlan, error: insertErr } = await supabase
            .from("journey_plans")
            .insert({ user_id: user.id, slug, verses })
            .select("id, verses")
            .single();

        if (insertErr || !newPlan) {
            const isNoTable = (insertErr as { code?: string } | null)?.code === "42P01";
            const msg = isNoTable
                ? "Execute a migration 002_journey_tables.sql no Supabase Dashboard antes de usar as jornadas."
                : "Erro ao salvar plano.";
            return NextResponse.json({ error: msg }, { status: 500 });
        }
        plan = newPlan;
    }

    // 3. Buscar dias já gerados
    const { data: completedRows } = await supabase
        .from("journey_days")
        .select("day, generated_at")
        .eq("user_id", user.id)
        .eq("slug", slug)
        .order("day");

    const completed: CompletedDay[] = completedRows ?? [];

    // 4. Montar resposta com status de cada dia
    const days = (plan.verses as PlanVerse[]).map((v) => ({
        day: v.day,
        reference: v.reference,
        theme: v.theme,
        status: computeStatus(v.day, completed, isMaster, userIsPremium),
        generated_at: completed.find((c) => c.day === v.day)?.generated_at,
    }));

    if (!existingPlan) {
        await logEvent(supabase, user.id, EVENTS.JOURNEY_STARTED, { slug, tier: userIsPremium ? "premium" : "free" });
    }

    return NextResponse.json({
        plan_id: plan.id,
        days,
        is_new: !existingPlan,
    });
}
