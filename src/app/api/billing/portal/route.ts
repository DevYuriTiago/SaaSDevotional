import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";

export async function POST() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_customer_id")
        .eq("id", user.id)
        .single();

    const customerId = profile?.stripe_customer_id as string | null | undefined;
    if (!customerId) {
        return NextResponse.json(
            { error: "Nenhuma assinatura encontrada para gerenciar." },
            { status: 400 }
        );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${appUrl}/profile`,
    });

    return NextResponse.json({ url: session.url });
}
