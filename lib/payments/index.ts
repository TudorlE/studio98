import type { PaymentProvider } from "@/lib/payments/provider";
import { stripeProvider } from "@/lib/payments/stripe";

/**
 * Provider registry. Set PAYMENT_PROVIDER in env to switch.
 * Add new processors here — implement `PaymentProvider` in a sibling file.
 */
const providers: Record<string, PaymentProvider> = {
  stripe: stripeProvider,
};

export function getPaymentProvider(): PaymentProvider {
  const id = process.env.PAYMENT_PROVIDER ?? "stripe";
  const provider = providers[id];
  if (!provider) {
    throw new Error(`Unknown PAYMENT_PROVIDER "${id}"`);
  }
  return provider;
}

export function isPaymentConfigured(): boolean {
  try {
    return getPaymentProvider().isConfigured();
  } catch {
    return false;
  }
}
