"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";

type OrderActionProps = {
  orderId: number;
  paymentId: number | null;
  shipmentId: number | null;
  current: {
    orderStatus: string;
    paymentStatus: string;
    shippingStatus: string;
  };
  shipment: {
    courierName: string | null;
    shippingService: string | null;
    trackingNumber: string | null;
    shippingCostCents: number;
    estimatedDeliveryUnix: number | null;
    notes: string | null;
  };
  nextOrderStatuses: string[];
  nextShippingStatuses: string[];
};

async function api(method: string, url: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = res.status === 204 ? {} : await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (j as { error?: { message: string } })?.error?.message ?? "Request failed",
    );
  }
  return j;
}

export function OrderActionsPanel(props: OrderActionProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  async function run(key: string, fn: () => Promise<void>) {
    setError(null);
    setBusyKey(key);
    try {
      await fn();
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Payment panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between gap-2">
            Payment <StatusBadge status={props.current.paymentStatus} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {props.paymentId === null ? (
            <p className="text-sm text-muted-foreground">No payment record.</p>
          ) : (
            <>
              <Button
                onClick={() =>
                  run("paid", () =>
                    api(
                      "POST",
                      `/api/admin/payments/${props.paymentId}/mark-paid`,
                    ),
                  )
                }
                disabled={
                  busyKey === "paid" ||
                  props.current.paymentStatus === "paid" ||
                  ["cancelled", "refunded"].includes(props.current.paymentStatus)
                }
                className="w-full"
              >
                {busyKey === "paid" ? "Marking…" : "Mark as paid"}
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  run("failed", () =>
                    api(
                      "POST",
                      `/api/admin/payments/${props.paymentId}/mark-failed`,
                    ),
                  )
                }
                disabled={
                  busyKey === "failed" ||
                  ["paid", "cancelled", "refunded", "failed"].includes(
                    props.current.paymentStatus,
                  )
                }
                className="w-full"
              >
                Mark as failed
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  run("cancel", () =>
                    api(
                      "POST",
                      `/api/admin/payments/${props.paymentId}/cancel`,
                    ),
                  )
                }
                disabled={
                  busyKey === "cancel" ||
                  ["paid", "cancelled", "refunded"].includes(
                    props.current.paymentStatus,
                  )
                }
                className="w-full"
              >
                Cancel payment
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  run("refund", () =>
                    api(
                      "POST",
                      `/api/admin/payments/${props.paymentId}/refund-simulation`,
                    ),
                  )
                }
                disabled={
                  busyKey === "refund" ||
                  props.current.paymentStatus !== "paid"
                }
                className="w-full text-amber-700"
              >
                Refund (simulation)
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Shipment panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between gap-2">
            Shipment <StatusBadge status={props.current.shippingStatus} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ShipmentForm
            shipmentId={props.shipmentId}
            shipment={props.shipment}
            current={props.current.shippingStatus}
            nextOptions={props.nextShippingStatuses}
            onAction={run}
            busyKey={busyKey}
          />
        </CardContent>
      </Card>

      {/* Order status panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between gap-2">
            Order status <StatusBadge status={props.current.orderStatus} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {props.nextOrderStatuses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Order is in a terminal state — no transitions available.
            </p>
          ) : (
            props.nextOrderStatuses.map((s) => (
              <Button
                key={s}
                onClick={() =>
                  run(`os-${s}`, () =>
                    api("PATCH", `/api/admin/orders/${props.orderId}/status`, {
                      status: s,
                    }),
                  )
                }
                disabled={busyKey === `os-${s}`}
                variant={s === "cancelled" ? "outline" : "default"}
                className={`w-full capitalize ${s === "cancelled" ? "text-destructive" : ""}`}
              >
                Move to {s.replace(/_/g, " ")}
              </Button>
            ))
          )}
        </CardContent>
      </Card>

      <ManualNoteForm orderId={props.orderId} />
    </div>
  );
}

function ShipmentForm({
  shipmentId,
  shipment,
  current,
  nextOptions,
  onAction,
  busyKey,
}: {
  shipmentId: number | null;
  shipment: OrderActionProps["shipment"];
  current: string;
  nextOptions: string[];
  onAction: (key: string, fn: () => Promise<void>) => Promise<void>;
  busyKey: string | null;
}) {
  if (!shipmentId) {
    return <p className="text-sm text-muted-foreground">No shipment.</p>;
  }
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const eta = String(fd.get("estimatedDelivery") ?? "");
        const etaUnix = eta
          ? Math.floor(new Date(eta).getTime() / 1000)
          : null;
        const body = {
          courierName: String(fd.get("courierName") ?? "") || undefined,
          shippingService: String(fd.get("shippingService") ?? "") || undefined,
          trackingNumber: String(fd.get("trackingNumber") ?? "") || undefined,
          shippingCostCents: Math.round(
            Number(fd.get("shippingCost") ?? 0) * 100,
          ),
          estimatedDeliveryUnix: etaUnix,
          notes: String(fd.get("notes") ?? "") || undefined,
        };
        await onAction("ship-update", () =>
          api("PATCH", `/api/admin/shipments/${shipmentId}`, body),
        );
      }}
      className="space-y-3"
    >
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="courierName">Courier</Label>
          <Input
            id="courierName"
            name="courierName"
            defaultValue={shipment.courierName ?? ""}
            placeholder="e.g. NinjaVan"
          />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="shippingService">Service</Label>
          <Input
            id="shippingService"
            name="shippingService"
            defaultValue={shipment.shippingService ?? ""}
            placeholder="e.g. Standard"
          />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="trackingNumber">Tracking number</Label>
          <Input
            id="trackingNumber"
            name="trackingNumber"
            defaultValue={shipment.trackingNumber ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="shippingCost">Cost (SGD)</Label>
          <Input
            id="shippingCost"
            name="shippingCost"
            type="number"
            step="0.01"
            min="0"
            defaultValue={(shipment.shippingCostCents / 100).toFixed(2)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="estimatedDelivery">Est. delivery</Label>
          <Input
            id="estimatedDelivery"
            name="estimatedDelivery"
            type="date"
            defaultValue={
              shipment.estimatedDeliveryUnix
                ? new Date(shipment.estimatedDeliveryUnix * 1000)
                    .toISOString()
                    .slice(0, 10)
                : ""
            }
          />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            className="w-full rounded-md border border-input bg-background p-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            defaultValue={shipment.notes ?? ""}
          />
        </div>
      </div>
      <Button
        type="submit"
        disabled={busyKey === "ship-update"}
        className="w-full"
      >
        {busyKey === "ship-update" ? "Saving…" : "Save shipment details"}
      </Button>

      <div className="border-t pt-3 space-y-2">
        <p className="text-xs text-muted-foreground">Update shipping status:</p>
        {nextOptions.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No transitions available.
          </p>
        ) : (
          nextOptions.map((s) => (
            <Button
              key={s}
              type="button"
              variant="outline"
              onClick={() =>
                onAction(`ss-${s}`, () =>
                  api("PATCH", `/api/admin/shipments/${shipmentId}/status`, {
                    status: s,
                  }),
                )
              }
              disabled={busyKey === `ss-${s}`}
              className="w-full capitalize text-xs"
            >
              Mark as {s.replace(/_/g, " ")}
            </Button>
          ))
        )}
      </div>
    </form>
  );
}

function ManualNoteForm({ orderId }: { orderId: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Add manual note</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setBusy(true);
            const fd = new FormData(e.currentTarget);
            try {
              await api("POST", `/api/admin/orders/${orderId}/notes`, {
                title: String(fd.get("title")),
                description: String(fd.get("description") ?? "") || undefined,
              });
              (e.target as HTMLFormElement).reset();
              router.refresh();
            } catch (err) {
              setError((err as Error).message);
            } finally {
              setBusy(false);
            }
          }}
          className="space-y-2"
        >
          <Input
            name="title"
            placeholder="Title (e.g. 'Customer called')"
            required
          />
          <textarea
            name="description"
            rows={2}
            placeholder="Description (optional)"
            className="w-full rounded-md border border-input bg-background p-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" disabled={busy} variant="outline" className="w-full">
            {busy ? "Saving…" : "Add note"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
