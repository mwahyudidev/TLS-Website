import { Badge, type BadgeProps } from "@/components/ui/badge";

type StatusKey =
  // order
  | "pending"
  | "processing"
  | "packed"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled"
  | "refunded"
  // payment
  | "unpaid"
  | "paid"
  | "failed"
  // shipping
  | "not_shipped"
  | "preparing"
  | "in_transit"
  | "returned";

const VARIANT_MAP: Record<StatusKey, BadgeProps["variant"]> = {
  pending: "muted",
  unpaid: "muted",
  not_shipped: "muted",
  preparing: "muted",
  processing: "info",
  packed: "info",
  shipped: "indigo",
  in_transit: "indigo",
  paid: "success",
  delivered: "success",
  completed: "success",
  cancelled: "destructive",
  failed: "destructive",
  returned: "destructive",
  refunded: "warning",
};

const LABELS: Record<StatusKey, string> = {
  pending: "Pending",
  unpaid: "Unpaid",
  not_shipped: "Not shipped",
  preparing: "Preparing",
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  in_transit: "In transit",
  paid: "Paid",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
  failed: "Failed",
  returned: "Returned",
  refunded: "Refunded",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const key = status as StatusKey;
  const variant = VARIANT_MAP[key] ?? "secondary";
  const label = LABELS[key] ?? status;
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
