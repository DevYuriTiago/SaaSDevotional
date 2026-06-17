import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";

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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        customer_email: user.email,
        success_url: `${appUrl}/dashboard?upgraded=1`,
        cancel_url: `${appUrl}/subscription?cancelled=1`,
        subscription_data: {
            metadata: { supabase_user_id: user.id },
        },
        metadata: { supabase_user_id: user.id },
    });

    return NextResponse.json({ url: session.url });
}
