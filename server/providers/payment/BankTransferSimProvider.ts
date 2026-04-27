import { randomBytes } from "node:crypto";
import { formatMoney } from "@/lib/format";
import type {
  CreatePaymentInput,
  CreatePaymentOutput,
  PaymentProvider,
} from "./PaymentProvider";

export const BankTransferSimProvider: PaymentProvider = {
  id: "bank_transfer_simulation",
  displayName: "Bank transfer (simulation)",
  description: "Simulated bank transfer with virtual account number.",

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentOutput> {
    const ref = `VA-${input.orderNumber}-${randomBytes(3).toString("hex").toUpperCase()}`;
    const va = `8801${String(input.orderId).padStart(8, "0")}${randomBytes(2)
      .toString("hex")
      .toUpperCase()}`;
    return {
      transactionReference: ref,
      paymentMethod: "Bank transfer (simulation)",
      initialStatus: "pending",
      instructions: {
        title: "Bank transfer — simulated virtual account",
        body: [
          "Transfer the exact amount to the virtual account below.",
          "",
          `Bank: SIM Bank (DEMO ONLY)`,
          `Virtual Account: ${va}`,
          `Account name: The Line Seafood`,
          `Amount: ${formatMoney(input.amountCents)}`,
          `Reference: ${ref}`,
          "",
          "This payment is simulated — no real transfer is processed. The admin will mark the order as paid manually.",
        ].join("\n"),
        reference: ref,
        amountCents: input.amountCents,
        details: { virtualAccount: va, bank: "SIM Bank" },
      },
    };
  },
};
