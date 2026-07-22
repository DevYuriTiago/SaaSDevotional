import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeEmotion, generateDevotional } from "@/lib/gemini/devotional-ai";
import { FREE_DEVOTIONAL_LIMIT } from "@/lib/constants";
import { validateReference } from "@/lib/bible/canon";
import { logEvent, EVENTS } from "@/lib/analytics/events";
import { isPremium, extendPremiumUntil } from "@/lib/premium";
import { aiErrorResponse } from "@/lib/ai/errors";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import type { DevotionalContent } from "@/types";

const REFERRAL_REWARD_DAYS = 7;

// Concede premium temporário a convidante e convidado quando o convidado gera
// seu 1º devocional. Usa service role (escreve no perfil de outro usuário).
async function rewardReferralIfPending(inviteeId: string, inviteePremiumUntil: string | null) {
    const admin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: ref } = await admin
        .from("referrals")
        .select("id, referrer_id, status")
        .eq("invitee_id", inviteeId)
        .maybeSingle();

    if (!ref || ref.status !== "pending") return;

    // Convidado
    await admin
        .from("profiles")
        .update({ premium_until: extendPremiumUntil(inviteePremiumUntil, REFERRAL_REWARD_DAYS) })
        .eq("id", inviteeId);

    // Convidante (lê o premium_until atual para empilhar)
    const { data: referrer } = await admin
        .from("profiles")
        .select("premium_until")
        .eq("id", ref.referrer_id)
        .single();
    await admin
        .from("profiles")
        .update({ premium_until: extendPremiumUntil(referrer?.premium_until ?? null, REFERRAL_REWARD_DAYS) })
        .eq("id", ref.referrer_id);

    await admin
        .from("referrals")
        .update({ status: "rewarded", rewarded_at: new Date().toISOString() })
        .eq("id", ref.id);
}

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

    // Enforce free limit (skip in MASTER_MODE). Premium = assinatura OU premium temporário.
    const isFree = !isPremium(profile);
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
        // Step 0: histórico de versículos já usados pelo usuário (anti-repetição).
        // Sem isso a IA cai sempre nos mesmos clichês (ex.: ansiedade → Filipenses 4:6-7).
        const { data: usedRows } = await supabase
            .from("devotionals")
            .select("verse_reference")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(60);
        const normalizeRef = (r: string) => r.toLowerCase().replace(/\s+/g, " ").trim();
        const forbiddenRefs = [...new Set((usedRows ?? []).map((r) => r.verse_reference as string).filter(Boolean))];
        const forbiddenSet = new Set(forbiddenRefs.map(normalizeRef));

        // Step 1: Analyze emotion
        const emotionAnalysis = await analyzeEmotion(emotion_raw.trim());

        // Step 2: Generate devotional — valida a referência (anti-alucinação) E
        // rejeita versículo já usado pelo usuário (anti-repetição); regenera se preciso.
        let content: DevotionalContent | null = null;
        for (let attempt = 0; attempt < 3; attempt++) {
            const rawContent = await generateDevotional(
                emotion_raw.trim(),
                emotionAnalysis,
                profile.name,
                forbiddenRefs
            );
            const parsed = JSON.parse(rawContent) as DevotionalContent;
            content = parsed; // mantém a última tentativa como fallback

            const check = validateReference(parsed.verse_reference);
            const repeated = forbiddenSet.has(normalizeRef(parsed.verse_reference));
            if (check.valid && !repeated) break;

            if (repeated) {
                console.warn(`[devotional/generate] versículo repetido (tentativa ${attempt + 1}): "${parsed.verse_reference}"`);
            } else {
                console.warn(`[devotional/generate] referência inválida (tentativa ${attempt + 1}): "${parsed.verse_reference}" — ${check.reason}`);
            }
        }
        if (!content) throw new Error("Falha ao gerar devocional");

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

        const isFirstDevotional = profile.devotionals_used === 0;

        // Ativação: marca se este é o primeiro devocional do usuário.
        await logEvent(supabase, user.id, EVENTS.DEVOTIONAL_GENERATED, {
            first: isFirstDevotional,
            emotion: emotionAnalysis.primary_emotion,
            tier: profile.subscription_tier,
        });

        // Loop de convite: recompensa ambos quando o convidado ativa (1º devocional).
        if (isFirstDevotional && profile.referred_by) {
            await rewardReferralIfPending(user.id, profile.premium_until ?? null);
        }

        return NextResponse.json({ devotional, emotion_analysis: emotionAnalysis });
    } catch (error: unknown) {
        return aiErrorResponse(error, { subject: "seu devocional" });
    }
}
