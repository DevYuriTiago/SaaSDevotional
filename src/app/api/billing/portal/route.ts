import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";
import { appUrl } from "@/lib/app-url";

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

    const baseUrl = appUrl();

    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${baseUrl}/profile`,
    });

    return NextResponse.json({ url: session.url });
}
