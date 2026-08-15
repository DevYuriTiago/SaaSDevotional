import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createClient } from "@supabase/supabase-js";
import { logEvent, EVENTS } from "@/lib/analytics/events";
import { creditAmbassador } from "@/lib/ambassadors/credit";
import Stripe from "stripe";

const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type BillingFields = {
    stripe_customer_id?: string | null;
    stripe_subscription_id?: string | null;
    subscription_status?: string | null;
    subscription_current_period_end?: string | null;
};

async function upgradeUser(userId: string, billing: BillingFields = {}) {
    await admin
        .from("profiles")
        .update({ subscription_tier: "premium", ...billing })
        .eq("id", userId);
}

async function downgradeUser(userId: string, billing: BillingFields = {}) {
    await admin
        .from("profiles")
        .update({ subscription_tier: "free", ...billing })
        .eq("id", userId);
}

// Stripe envia current_period_end em segundos (epoch). Converte para ISO.
function periodEndISO(sub: Stripe.Subscription): string | null {
    const end = (sub as unknown as { current_period_end?: number }).current_period_end;
    return typeof end === "number" ? new Date(end * 1000).toISOString() : null;
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
            if (!uid) break;
            const customerId = typeof session.customer === "string" ? session.customer : null;
            const subId = typeof session.subscription === "string" ? session.subscription : null;
            await upgradeUser(uid, {
                stripe_customer_id: customerId,
                stripe_subscription_id: subId,
                subscription_status: "active",
            });
            await logEvent(admin, uid, EVENTS.SUBSCRIPTION_ACTIVATED, {
                amount_total: session.amount_total,
                currency: session.currency,
            });
            await creditAmbassador(admin, {
                userId: uid,
                invoiceId: typeof session.invoice === "string" ? session.invoice : null,
                grossCents: session.amount_total ?? null,
                currency: session.currency ?? "brl",
                eventType: event.type,
            });
            break;
        }
        case "invoice.payment_succeeded": {
            const invoice = event.data.object as Stripe.Invoice;
            // Stripe SDK v22 moved subscription to parent; keep runtime compat via cast
            const subId = (invoice as unknown as { subscription?: string | null }).subscription ?? null;
            if (!subId) break; // initial checkout invoice — already handled by checkout.session.completed
            const sub = await stripe.subscriptions.retrieve(subId);
            const uid = getUserId(sub);
            if (uid) {
                await upgradeUser(uid, {
                    stripe_customer_id: typeof sub.customer === "string" ? sub.customer : null,
                    stripe_subscription_id: sub.id,
                    subscription_status: sub.status,
                    subscription_current_period_end: periodEndISO(sub),
                });
                // Renovação (a 1ª fatura é creditada em checkout.session.completed e
                // não cai aqui por causa do `if (!subId) break` acima).
                await creditAmbassador(admin, {
                    userId: uid,
                    invoiceId: invoice.id ?? null,
                    grossCents: (invoice as unknown as { amount_paid?: number }).amount_paid ?? null,
                    currency: invoice.currency ?? "brl",
                    eventType: event.type,
                });
            }
            break;
        }
        case "customer.subscription.updated": {
            // Mudança de status/renovação/cancelamento agendado.
            const sub = event.data.object as Stripe.Subscription;
            const uid = getUserId(sub);
            if (!uid) break;
            const active = sub.status === "active" || sub.status === "trialing";
            const billing: BillingFields = {
                stripe_customer_id: typeof sub.customer === "string" ? sub.customer : null,
                stripe_subscription_id: sub.id,
                subscription_status: sub.status,
                subscription_current_period_end: periodEndISO(sub),
            };
            if (active) await upgradeUser(uid, billing);
            else await downgradeUser(uid, billing);
            break;
        }
        case "charge.refunded": {
            // Dinheiro devolvido não gera comissão. O estorno chega como evento,
            // então a conversão é marcada na hora em vez de descoberta depois.
            const charge = event.data.object as Stripe.Charge;
            // O SDK v22 tirou `invoice` do tipo Charge, mas o campo continua
            // vindo no payload. Mesmo tratamento dado a `subscription` acima.
            const chargeInvoice = (charge as unknown as { invoice?: string | null }).invoice;
            const invoiceId = typeof chargeInvoice === "string" ? chargeInvoice : null;
            if (!invoiceId) break;
            await admin
                .from("conversions")
                .update({ status: "refunded" })
                .eq("stripe_invoice_id", invoiceId);
            break;
        }
        case "customer.subscription.deleted":
        case "invoice.payment_failed": {
            const obj = event.data.object as Stripe.Subscription | Stripe.Invoice;
            const invoiceSub = (obj as unknown as { subscription?: string | null }).subscription;
            const subId = obj.object === "invoice" ? (invoiceSub ?? null) : (obj as Stripe.Subscription).id;
            if (!subId) break;
            const sub = await stripe.subscriptions.retrieve(subId);
            const uid = getUserId(sub);
            if (uid) await downgradeUser(uid, {
                stripe_subscription_id: sub.id,
                subscription_status: sub.status,
                subscription_current_period_end: periodEndISO(sub),
            });
            break;
        }
    }

    return NextResponse.json({ received: true });
}
