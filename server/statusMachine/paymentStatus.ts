import type { PaymentStatus } from "@/db/schema";
import { errors } from "@/server/lib/errors";

const ALLOWED: Record<PaymentStatus, PaymentStatus[]> = {
  unpaid: ["pending", "paid", "failed", "cancelled"],
  pending: ["paid", "failed", "cancelled"],
  paid: ["refunded"],
  failed: ["unpaid", "pending", "paid"],
  cancelled: [],
  refunded: [],
};

export function assertPaymentTransition(
  from: PaymentStatus,
  to: PaymentStatus,
) {
  if (from === to) return;
  if (!ALLOWED[from].includes(to)) {
    throw errors.invalidTransition(from, to);
  }
}

export function canTransitionPayment(from: PaymentStatus, to: PaymentStatus) {
  return from === to || ALLOWED[from].includes(to);
}
