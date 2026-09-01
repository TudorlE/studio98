/**
 * Payment provider abstraction.
 *
 * The rest of the app only knows about this interface. Swapping Stripe for a
 * Moldova-friendly processor (e.g. maib / MAIB ecommerce, Paynet, etc.) means
 * writing one new file that implements `PaymentProvider` and registering it in
 * `lib/payments/index.ts` — no route or UI changes.
 */

export type CheckoutLineItem = {
  name: string;
  description?: string;
  /** Minor units (cents). */
  amount: number;
  currency: string;
  quantity: number;
};

export type CreateCheckoutParams = {
  bookingId: string;
  lineItems: CheckoutLineItem[];
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
};

export type CheckoutSession = {
  id: string;
  /** Where to redirect the customer to pay. */
  url: string;
};

export type WebhookResult =
  | { type: "payment_succeeded"; bookingId: string; reference: string; amount: number }
  | { type: "payment_failed"; bookingId: string; reference: string }
  | { type: "ignored" };

export interface PaymentProvider {
  readonly id: string;
  isConfigured(): boolean;
  createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSession>;
  /**
   * Verify + parse a provider webhook. `signature` is provider specific
   * (Stripe: `stripe-signature` header).
   */
  parseWebhook(rawBody: string, signature: string | null): Promise<WebhookResult>;
}
