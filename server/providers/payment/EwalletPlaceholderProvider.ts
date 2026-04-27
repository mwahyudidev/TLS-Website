import { randomBytes } from "node:crypto";
import { formatMoney } from "@/lib/format";
import type {
  CreatePaymentInput,
  CreatePaymentOutput,
  PaymentProvider,
} from "./PaymentProvider";

export const EwalletPlaceholderProvider: PaymentProvider = {
  id: "ewallet_simulation_placeholder",
  displayName: "E-wallet (placeholder)",
  description:
    "Placeholder for e-wallet integration (e.g. PayNow, GrabPay) — simulated only.",

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentOutput> {
    const ref = `EWA-${input.orderNumber}-${randomBytes(3).toString("hex").toUpperCase()}`;
    return {
      transactionReference: ref,
      paymentMethod: "E-wallet (placeholder)",
      initialStatus: "pending",
      instructions: {
        title: "E-wallet — simulated placeholder",
        body: [
          "Real e-wallet integration is not active in this phase.",
          "",
          `Amount: ${formatMoney(input.amountCents)}`,
          `Reference: ${ref}`,
          "",
          "An admin will manually mark this order as paid for testing. In production, this flow would redirect to the e-wallet provider.",
        ].join("\n"),
        reference: ref,
        amountCents: input.amountCents,
      },
    };
  },
};
