import { randomBytes } from "node:crypto";
import { formatMoney } from "@/lib/format";
import type {
  CreatePaymentInput,
  CreatePaymentOutput,
  PaymentProvider,
} from "./PaymentProvider";

export const ManualPaymentProvider: PaymentProvider = {
  id: "manual_simulation",
  displayName: "Manual payment (simulation)",
  description:
    "For testing only — the store admin will manually mark this order as paid.",

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentOutput> {
    const ref = `MAN-${input.orderNumber}-${randomBytes(3).toString("hex").toUpperCase()}`;
    return {
      transactionReference: ref,
      paymentMethod: "Manual payment (simulation)",
      initialStatus: "unpaid",
      instructions: {
        title: "Manual payment — awaiting confirmation",
        body: [
          `Order: ${input.orderNumber}`,
          `Amount: ${formatMoney(input.amountCents)}`,
          `Reference: ${ref}`,
          "",
          "This is a SIMULATED payment. The store admin will mark your order as paid for testing purposes.",
        ].join("\n"),
        reference: ref,
        amountCents: input.amountCents,
      },
    };
  },
};
