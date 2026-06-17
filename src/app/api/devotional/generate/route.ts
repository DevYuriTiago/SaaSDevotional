import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeEmotion, generateDevotional } from "@/lib/gemini/devotional-ai";
import { FREE_DEVOTIONAL_LIMIT } from "@/lib/constants";
import type { DevotionalContent } from "@/types";

export async function POST(request: NextRequest) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Load profile — cria automaticamente se não existir (usuário cadastrado antes da migration)
    let { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (!profile) {
        const { data: newProfile, error: upsertError } = await supabase
            .from("profiles")
            .upsert({
                id: user.id,
                name: user.user_metadata?.name ?? null,
            })
            .select()
            .single();

        if (upsertError || !newProfile) {
            return NextResponse.json({ error: "Erro ao criar perfil" }, { status: 500 });
        }
        profile = newProfile;
    }

    // Enforce free limit (skip in MASTER_MODE)
    const isFree = profile.subscription_tier === "free";
    if (isFree && profile.devotionals_used >= FREE_DEVOTIONAL_LIMIT && process.env.MASTER_MODE !== "true") {
        return NextResponse.json(
            { error: "limit_reached", message: "Limite do plano gratuito atingido." },
            { status: 402 }
        );
    }

    const body = await request.json();
    const { emotion_raw } = body as { emotion_raw: string };

    if (!emotion_raw || emotion_raw.trim().length < 2) {
        return NextResponse.json({ error: "Emoção inválida" }, { status: 400 });
    }

    try {
        // Step 1: Analyze emotion
        const emotionAnalysis = await analyzeEmotion(emotion_raw.trim());

        // Step 2: Generate devotional
        const rawContent = await generateDevotional(
            emotion_raw.trim(),
            emotionAnalysis,
            profile.name
        );

        const content: DevotionalContent = JSON.parse(rawContent);

        // Step 3: Save to DB
        const { data: devotional, error: insertError } = await supabase
            .from("devotionals")
            .insert({
                user_id: user.id,
                emotion: emotionAnalysis.primary_emotion,
                emotion_raw: emotion_raw.trim(),
                title: content.title,
                verse: content.verse,
                verse_reference: content.verse_reference,
                reflection: content.reflection,
                practical_application: content.practical_application,
                prayer: content.prayer,
                declaration: content.declaration,
                reflective_question: content.reflective_question,
                is_saved: false,
            })
            .select()
            .single();

        if (insertError) throw insertError;

        // Step 4: Increment usage + streak
        // Streak por dia de calendário (UTC). Gerar mais de um devocional no MESMO
        // dia não deve quebrar a sequência — só conta a transição de dia.
        const today = new Date().toISOString().split("T")[0];
        const lastDate = profile.last_devotional_date as string | null;

        let nextStreak: number;
        if (!lastDate) {
            nextStreak = 1; // primeiro devocional
        } else if (lastDate === today) {
            nextStreak = profile.streak_days; // mesmo dia — mantém a sequência
        } else {
            const diffDays = Math.round(
                (new Date(today).getTime() - new Date(lastDate).getTime()) / 86400000
            );
            nextStreak = diffDays === 1 ? profile.streak_days + 1 : 1;
        }

        await supabase
            .from("profiles")
            .update({
                devotionals_used: profile.devotionals_used + 1,
                total_devotionals: profile.total_devotionals + 1,
                streak_days: nextStreak,
                last_devotional_date: today,
            })
            .eq("id", user.id);

        return NextResponse.json({ devotional, emotion_analysis: emotionAnalysis });
    } catch (error: unknown) {
        console.error("[devotional/generate] Error:", error);

        const msg = error instanceof Error ? error.message : String(error);

        if (msg.includes("429") || msg.includes("quota") || msg.includes("Too Many Requests")) {
            return NextResponse.json(
                { error: "quota_exceeded", message: "Limite de requisições da IA atingido. Aguarde alguns minutos e tente novamente." },
                { status: 429 }
            );
        }

        if (msg.includes("404") || msg.includes("no longer available") || msg.includes("Not Found")) {
            return NextResponse.json(
                { error: "model_unavailable", message: "Modelo de IA indisponível. Verifique a configuração da API." },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { error: "Erro ao gerar devocional. Tente novamente." },
            { status: 500 }
        );
    }
}
