import type { ShippingStatus } from "@/db/schema";
import { errors } from "@/server/lib/errors";

const ALLOWED: Record<ShippingStatus, ShippingStatus[]> = {
  not_shipped: ["preparing", "packed", "shipped"],
  preparing: ["packed", "shipped", "failed"],
  packed: ["shipped", "failed"],
  shipped: ["in_transit", "delivered", "failed", "returned"],
  in_transit: ["delivered", "failed", "returned"],
  delivered: ["returned"],
  failed: ["preparing", "shipped"],
  returned: [],
};

export function assertShippingTransition(
  from: ShippingStatus,
  to: ShippingStatus,
) {
  if (from === to) return;
  if (!ALLOWED[from].includes(to)) {
    throw errors.invalidTransition(from, to);
  }
}

export function canTransitionShipping(
  from: ShippingStatus,
  to: ShippingStatus,
) {
  return from === to || ALLOWED[from].includes(to);
}
