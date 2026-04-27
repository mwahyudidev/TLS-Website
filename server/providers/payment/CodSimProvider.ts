import { randomBytes } from "node:crypto";
import { formatMoney } from "@/lib/format";
import type {
  CreatePaymentInput,
  CreatePaymentOutput,
  PaymentProvider,
} from "./PaymentProvider";

export const CodSimProvider: PaymentProvider = {
  id: "cod_simulation",
  displayName: "Cash on delivery (simulation)",
  description:
    "Pay in cash when the courier arrives. Simulated for testing — admin marks paid on delivery.",

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentOutput> {
    const ref = `COD-${input.orderNumber}-${randomBytes(3).toString("hex").toUpperCase()}`;
    return {
      transactionReference: ref,
      paymentMethod: "Cash on delivery (simulation)",
      initialStatus: "unpaid",
      instructions: {
        title: "Cash on delivery — simulation",
        body: [
          "Please prepare the exact amount in cash for the courier.",
          "",
          `Amount due on delivery: ${formatMoney(input.amountCents)}`,
          `Reference: ${ref}`,
          "",
          "Note: This is a simulation. The admin will mark the order as paid once 'delivery' is recorded.",
        ].join("\n"),
        reference: ref,
        amountCents: input.amountCents,
      },
    };
  },
};
