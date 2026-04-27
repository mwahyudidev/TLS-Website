import { Check, Circle, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";

// Canonical 9-step customer-facing timeline. Each step maps to one or more
// status transitions in order_status_history.
type Step = {
  key: string;
  title: string;
  description: string;
  matches: (h: TimelineEvent) => boolean;
};

export type TimelineEvent = {
  type: "order" | "payment" | "shipping";
  title: string;
  description: string | null;
  status: string;
  createdAt: number;
};

const STEPS: Step[] = [
  {
    key: "placed",
    title: "Order placed",
    description: "We've received your order",
    matches: (h) => h.type === "order" && h.status === "pending",
  },
  {
    key: "payment_waiting",
    title: "Awaiting payment",
    description: "Complete the simulated payment",
    matches: (h) =>
      h.type === "payment" && (h.status === "unpaid" || h.status === "pending"),
  },
  {
    key: "payment_confirmed",
    title: "Payment confirmed",
    description: "Payment received",
    matches: (h) => h.type === "payment" && h.status === "paid",
  },
  {
    key: "processing",
    title: "Processing",
    description: "Preparing your order",
    matches: (h) => h.type === "order" && h.status === "processing",
  },
  {
    key: "packed",
    title: "Packed",
    description: "Your order has been packed",
    matches: (h) =>
      (h.type === "order" || h.type === "shipping") && h.status === "packed",
  },
  {
    key: "shipped",
    title: "Shipped",
    description: "On its way",
    matches: (h) =>
      (h.type === "order" || h.type === "shipping") && h.status === "shipped",
  },
  {
    key: "in_transit",
    title: "In transit",
    description: "Out for delivery",
    matches: (h) => h.type === "shipping" && h.status === "in_transit",
  },
  {
    key: "delivered",
    title: "Delivered",
    description: "Order arrived",
    matches: (h) =>
      (h.type === "order" || h.type === "shipping") && h.status === "delivered",
  },
  {
    key: "completed",
    title: "Completed",
    description: "Order is complete",
    matches: (h) => h.type === "order" && h.status === "completed",
  },
];

export function TrackingTimeline({
  events,
  orderStatus,
  paymentStatus,
}: {
  events: TimelineEvent[];
  orderStatus: string;
  paymentStatus: string;
}) {
  const cancelled =
    orderStatus === "cancelled" || paymentStatus === "cancelled";
  const refunded = orderStatus === "refunded";
  const failed = paymentStatus === "failed";

  if (cancelled || refunded || failed) {
    return <TerminalState events={events} variant={cancelled ? "cancelled" : refunded ? "refunded" : "failed"} />;
  }

  // Find the latest matching event for each step. Steps with a match are "completed".
  // The last completed step is the "current".
  const completed: Record<string, TimelineEvent | undefined> = {};
  for (const step of STEPS) {
    let lastMatch: TimelineEvent | undefined;
    for (const ev of events) {
      if (step.matches(ev)) lastMatch = ev;
    }
    completed[step.key] = lastMatch;
  }

  const lastCompletedIndex = STEPS.reduce(
    (acc, s, i) => (completed[s.key] ? i : acc),
    -1,
  );

  return (
    <ol className="relative border-l-2 border-border ml-4 space-y-6">
      {STEPS.map((step, i) => {
        const ev = completed[step.key];
        const isCompleted = !!ev;
        const isCurrent = i === lastCompletedIndex;
        const isPast = isCompleted && !isCurrent;
        const isUpcoming = !isCompleted;

        return (
          <li key={step.key} className="ml-6">
            <span
              className={cn(
                "absolute -left-[13px] flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background",
                isPast && "bg-emerald-600 text-white",
                isCurrent && "bg-blue-600 text-white animate-pulse",
                isUpcoming && "bg-muted text-muted-foreground",
              )}
            >
              {isPast ? (
                <Check className="h-3.5 w-3.5" />
              ) : isCurrent ? (
                <Clock className="h-3 w-3" />
              ) : (
                <Circle className="h-2 w-2" />
              )}
            </span>
            <div
              className={cn(
                "min-h-[44px]",
                isUpcoming && "text-muted-foreground",
              )}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm">{step.title}</span>
                {isCurrent && (
                  <span className="text-xs rounded-full bg-blue-100 text-blue-800 px-2 py-0.5">
                    Current
                  </span>
                )}
              </div>
              <p className="text-xs mt-0.5">
                {ev?.description || step.description}
              </p>
              {ev && (
                <p className="text-xs mt-0.5 text-muted-foreground">
                  {formatDateTime(ev.createdAt)}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function TerminalState({
  events,
  variant,
}: {
  events: TimelineEvent[];
  variant: "cancelled" | "refunded" | "failed";
}) {
  const last = events[events.length - 1];
  const config = {
    cancelled: {
      title: "Order cancelled",
      description: "This order was cancelled.",
      icon: X,
      color: "bg-red-600",
    },
    refunded: {
      title: "Order refunded",
      description: "A refund was issued for this order.",
      icon: X,
      color: "bg-amber-500",
    },
    failed: {
      title: "Payment failed",
      description: "Payment for this order did not succeed.",
      icon: X,
      color: "bg-red-600",
    },
  }[variant];
  const Icon = config.icon;

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full text-white",
            config.color,
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <div className="font-medium">{config.title}</div>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>
      </div>
      {last && (
        <div className="mt-4 text-xs text-muted-foreground">
          Last update: {formatDateTime(last.createdAt)} — {last.title}
        </div>
      )}
    </div>
  );
}
