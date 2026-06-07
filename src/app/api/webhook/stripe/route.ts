import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function upgradeUser(userId: string) {
    await admin
        .from("profiles")
        .update({ subscription_tier: "premium" })
        .eq("id", userId);
}

async function downgradeUser(userId: string) {
    await admin
        .from("profiles")
        .update({ subscription_tier: "free" })
        .eq("id", userId);
}

export async function POST(request: NextRequest) {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
        return NextResponse.json({ error: "Assinatura ausente" }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch {
        return NextResponse.json({ error: "Webhook inválido" }, { status: 400 });
    }

    const getUserId = (obj: { metadata?: Record<string, string> | null }) =>
        obj.metadata?.supabase_user_id;

    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const uid = getUserId(session);
            if (uid) await upgradeUser(uid);
            break;
        }
        case "invoice.payment_succeeded": {
            const invoice = event.data.object as Stripe.Invoice;
            const subId = invoice.subscription as string | null;
            if (!subId) break; // initial checkout invoice — already handled by checkout.session.completed
            const sub = await stripe.subscriptions.retrieve(subId);
            const uid = getUserId(sub);
            if (uid) await upgradeUser(uid);
            break;
        }
        case "customer.subscription.deleted":
        case "invoice.payment_failed": {
            const obj = event.data.object as Stripe.Subscription | Stripe.Invoice;
            const subId = ("subscription" in obj ? obj.subscription as string | null : obj.id);
            if (!subId) break;
            const sub = await stripe.subscriptions.retrieve(subId);
            const uid = getUserId(sub);
            if (uid) await downgradeUser(uid);
            break;
        }
    }

    return NextResponse.json({ received: true });
}
