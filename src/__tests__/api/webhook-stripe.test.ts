// PATH: src/__tests__/api/webhook-stripe.test.ts

import { NextRequest } from "next/server";
import type Stripe from "stripe";

// ---------------------------------------------------------------------------
// Mocks — vi.hoisted garante que as variáveis sejam içadas junto com vi.mock
// ---------------------------------------------------------------------------

const { mockEq, mockFrom, mockConstructEvent, mockRetrieve } = vi.hoisted(() => {
  const mockEq = vi.fn().mockReturnValue({ error: null });
  const mockFrom = vi.fn(() => ({ update: () => ({ eq: mockEq }) }));
  const mockConstructEvent = vi.fn();
  const mockRetrieve = vi.fn();
  return { mockEq, mockFrom, mockConstructEvent, mockRetrieve };
});

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ from: mockFrom })),
}));

vi.mock("@/lib/stripe/client", () => ({
  stripe: {
    webhooks: { constructEvent: mockConstructEvent },
    subscriptions: { retrieve: mockRetrieve },
  },
}));

import { POST } from "@/app/api/webhook/stripe/route";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeWebhookReq(body: string, sig: string) {
  return new NextRequest("http://localhost/api/webhook/stripe", {
    method: "POST",
    headers: { "stripe-signature": sig, "content-type": "text/plain" },
    body,
  });
}

/** Cria um objeto Stripe.Event mínimo para os testes */
function makeStripeEvent(
  type: string,
  object: Record<string, unknown>
): Stripe.Event {
  return {
    id: "evt_test",
    object: "event",
    api_version: "2022-11-15",
    created: 0,
    livemode: false,
    pending_webhooks: 0,
    request: null,
    type,
    data: { object } as Stripe.Event.Data,
  } as Stripe.Event;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("POST /api/webhook/stripe", () => {
  beforeEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";

    vi.clearAllMocks();
    mockEq.mockReturnValue({ error: null });
  });

  it("retorna 400 quando o header stripe-signature está ausente", async () => {
    const req = new NextRequest("http://localhost/api/webhook/stripe", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "payload",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("retorna 400 quando constructEvent lança um erro (assinatura inválida)", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("Webhook signature verification failed");
    });

    const res = await POST(makeWebhookReq("payload", "bad-sig"));
    expect(res.status).toBe(400);
  });

  it("atualiza profiles para premium e retorna 200 em checkout.session.completed", async () => {
    const event = makeStripeEvent("checkout.session.completed", {
      object: "checkout.session",
      metadata: { supabase_user_id: "user-abc" },
    });

    mockConstructEvent.mockReturnValue(event);

    const res = await POST(makeWebhookReq("payload", "sig_valid"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ received: true });

    // Verifica que o update foi chamado com subscription_tier: "premium"
    expect(mockFrom).toHaveBeenCalledWith("profiles");
    expect(mockEq).toHaveBeenCalledWith("id", "user-abc");
  });

  it("atualiza profiles para free e retorna 200 em customer.subscription.deleted", async () => {
    const subscriptionObject = {
      id: "sub_xyz",
      object: "subscription",
      metadata: { supabase_user_id: "user-def" },
    };

    const event = makeStripeEvent(
      "customer.subscription.deleted",
      subscriptionObject
    );

    mockConstructEvent.mockReturnValue(event);
    mockRetrieve.mockResolvedValue(subscriptionObject);

    const res = await POST(makeWebhookReq("payload", "sig_valid"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ received: true });

    expect(mockEq).toHaveBeenCalledWith("id", "user-def");
  });

  it("retorna 200 sem side effects para eventos desconhecidos", async () => {
    const event = makeStripeEvent("payment_intent.created", {
      object: "payment_intent",
      id: "pi_test",
    });

    mockConstructEvent.mockReturnValue(event);

    const res = await POST(makeWebhookReq("payload", "sig_valid"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ received: true });

    // Nenhuma atualização no banco deve ter ocorrido
    expect(mockFrom).not.toHaveBeenCalled();
  });
});
