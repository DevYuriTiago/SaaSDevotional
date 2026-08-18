import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";
import { logEvent, EVENTS } from "@/lib/analytics/events";
import { appUrl } from "@/lib/app-url";

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Seleciona o preço conforme o plano escolhido (mensal por padrão).
    let plan: "month" | "year" = "month";
    try {
        const body = await request.json() as { plan?: string };
        if (body?.plan === "year" || body?.plan === "annual") plan = "year";
    } catch {
        // sem corpo → mantém mensal
    }

    const priceId =
        plan === "year"
            ? process.env.STRIPE_PRICE_ID_ANNUAL
            : process.env.STRIPE_PRICE_ID;

    if (!priceId || priceId.includes("SUBSTITUA")) {
        return NextResponse.json(
            { error: plan === "year" ? "Plano anual não configurado ainda." : "Pagamento não configurado ainda." },
            { status: 503 }
        );
    }

    const baseUrl = appUrl();

    // Reusa o customer existente se já houver — evita customers duplicados no Stripe.
    const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_customer_id")
        .eq("id", user.id)
        .single();

    const existingCustomer = profile?.stripe_customer_id as string | null | undefined;

    const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        ...(existingCustomer
            ? { customer: existingCustomer }
            : { customer_email: user.email ?? undefined }),
        success_url: `${baseUrl}/dashboard?upgraded=1`,
        cancel_url: `${baseUrl}/subscription?cancelled=1`,
        subscription_data: {
            metadata: { supabase_user_id: user.id },
        },
        metadata: { supabase_user_id: user.id },
    });

    await logEvent(supabase, user.id, EVENTS.CHECKOUT_STARTED, { plan });

    return NextResponse.json({ url: session.url });
}
