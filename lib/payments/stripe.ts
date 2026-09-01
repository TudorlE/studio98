import Stripe from "stripe";
import type {
  PaymentProvider,
  CreateCheckoutParams,
  CheckoutSession,
  WebhookResult,
} from "@/lib/payments/provider";

let stripe: Stripe | null = null;

function client(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  if (!stripe) {
    // Pin via the dashboard / account default; the SDK sends its bundled version.
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

export const stripeProvider: PaymentProvider = {
  id: "stripe",

  isConfigured() {
    return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
  },

  async createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSession> {
    const session = await client().checkout.sessions.create({
      mode: "payment",
      customer_email: params.customerEmail,
      // Card is always on; Apple Pay / Google Pay ride on top of `card`
      // automatically when the domain is verified in the Stripe dashboard.
      payment_method_types: ["card"],
      line_items: params.lineItems.map((li) => ({
        quantity: li.quantity,
        price_data: {
          currency: li.currency.toLowerCase(),
          unit_amount: li.amount,
          product_data: { name: li.name, description: li.description },
        },
      })),
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      client_reference_id: params.bookingId,
      metadata: params.metadata,
      // We never store card data — Stripe hosts the payment page.
      expires_at: Math.floor(Date.now() / 1000) + 60 * 30,
    });

    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    return { id: session.id, url: session.url };
  },

  async parseWebhook(rawBody: string, signature: string | null): Promise<WebhookResult> {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret || !signature) return { type: "ignored" };

    let event: Stripe.Event;
    try {
      event = client().webhooks.constructEvent(rawBody, signature, secret);
    } catch {
      throw new Error("Invalid Stripe webhook signature");
    }

    if (event.type === "checkout.session.completed") {
      const s = event.data.object as Stripe.Checkout.Session;
      const bookingId = s.client_reference_id ?? s.metadata?.bookingId ?? "";
      if (s.payment_status === "paid") {
        return {
          type: "payment_succeeded",
          bookingId,
          reference: typeof s.payment_intent === "string" ? s.payment_intent : s.id,
          amount: s.amount_total ?? 0,
        };
      }
    }

    if (
      event.type === "checkout.session.expired" ||
      event.type === "checkout.session.async_payment_failed"
    ) {
      const s = event.data.object as Stripe.Checkout.Session;
      return {
        type: "payment_failed",
        bookingId: s.client_reference_id ?? s.metadata?.bookingId ?? "",
        reference: s.id,
      };
    }

    return { type: "ignored" };
  },
};
