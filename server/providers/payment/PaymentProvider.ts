import type { PaymentProviderId } from "@/db/schema";

export type PaymentInstructions = {
  title: string;
  body: string; // safe to render as text; can include line breaks
  reference: string;
  amountCents: number;
  details?: Record<string, string>;
};

export type CreatePaymentInput = {
  orderId: number;
  orderNumber: string;
  amountCents: number;
  customerEmail: string;
  customerName: string;
};

export type CreatePaymentOutput = {
  transactionReference: string;
  paymentMethod: string; // human readable
  instructions: PaymentInstructions;
  redirectUrl?: string; // future: hosted checkout (Stripe)
  initialStatus: "unpaid" | "pending"; // some flows can start as pending
};

// The contract every payment provider must implement.
// Stripe will plug in the same way later — see docs/STRIPE-INTEGRATION.md
export interface PaymentProvider {
  readonly id: PaymentProviderId | "stripe"; // future
  readonly displayName: string;
  readonly description: string;

  createPayment(input: CreatePaymentInput): Promise<CreatePaymentOutput>;

  // Optional webhook handler for hosted gateways (no-op for manual sims)
  handleWebhook?(payload: unknown, signature: string): Promise<{ ok: boolean }>;
}
