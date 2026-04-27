import type { OrderStatus } from "@/db/schema";
import { errors } from "@/server/lib/errors";

const ALLOWED: Record<OrderStatus, OrderStatus[]> = {
  // 'processing' may skip 'packed' and go straight to 'shipped' — packed is
  // informational and many small stores ship without a packed-then-shipped split.
  pending: ["processing", "cancelled"],
  processing: ["packed", "shipped", "cancelled", "refunded"],
  packed: ["shipped", "cancelled", "refunded"],
  shipped: ["delivered", "refunded"],
  delivered: ["completed", "refunded"],
  completed: [],
  cancelled: [],
  refunded: [],
};

export function assertOrderTransition(from: OrderStatus, to: OrderStatus) {
  if (from === to) return; // idempotent — caller should still avoid no-op writes
  if (!ALLOWED[from].includes(to)) {
    throw errors.invalidTransition(from, to);
  }
}

export function canTransitionOrder(from: OrderStatus, to: OrderStatus) {
  return from === to || ALLOWED[from].includes(to);
}

export function nextOrderStatuses(from: OrderStatus): OrderStatus[] {
  return ALLOWED[from];
}
