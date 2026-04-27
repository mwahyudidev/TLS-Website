import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TrackingTimeline } from "@/components/shared/TrackingTimeline";
import { formatMoney, formatDate, formatDateTime } from "@/lib/format";
import type { PublicTracking } from "@/server/modules/tracking/service";

export function TrackingDetail({
  data,
  showLoggedInCta = false,
}: {
  data: PublicTracking;
  showLoggedInCta?: boolean;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base">
                  Order {data.orderNumber}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Placed {formatDateTime(data.createdAt)}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <StatusBadge status={data.orderStatus} />
                <StatusBadge status={data.paymentStatus} />
                <StatusBadge status={data.shippingStatus} />
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order journey</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <TrackingTimeline
              events={data.timeline}
              orderStatus={data.orderStatus}
              paymentStatus={data.paymentStatus}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Items</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {data.items.map((it, idx) => (
                <li
                  key={idx}
                  className="py-3 flex justify-between items-start gap-3"
                >
                  <div>
                    <div className="text-sm font-medium">{it.name}</div>
                    <div className="text-xs text-muted-foreground">
                      SKU {it.sku} · {it.quantity} ×{" "}
                      {formatMoney(it.unitPriceCents)}
                    </div>
                  </div>
                  <div className="text-sm font-semibold shrink-0">
                    {formatMoney(it.lineSubtotalCents)}
                  </div>
                </li>
              ))}
            </ul>
            <Separator className="my-3" />
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatMoney(data.subtotalCents)}</span>
              </div>
              {data.discountTotalCents > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span>−{formatMoney(data.discountTotalCents)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {data.shippingTotalCents === 0
                    ? "Free"
                    : formatMoney(data.shippingTotalCents)}
                </span>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatMoney(data.grandTotalCents)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <aside className="space-y-6">
        {data.shipment && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shipment</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <Row
                label="Courier"
                value={data.shipment.courierName ?? "Not assigned yet"}
              />
              <Row
                label="Service"
                value={data.shipment.shippingService ?? "—"}
              />
              <Row
                label="Tracking #"
                value={
                  data.shipment.trackingNumber ? (
                    <span className="font-mono">
                      {data.shipment.trackingNumber}
                    </span>
                  ) : (
                    "Pending"
                  )
                }
              />
              <Row
                label="Estimated delivery"
                value={
                  data.shipment.estimatedDelivery
                    ? formatDate(data.shipment.estimatedDelivery)
                    : "—"
                }
              />
              {data.shipment.shippedAt && (
                <Row
                  label="Shipped"
                  value={formatDateTime(data.shipment.shippedAt)}
                />
              )}
              {data.shipment.deliveredAt && (
                <Row
                  label="Delivered"
                  value={formatDateTime(data.shipment.deliveredAt)}
                />
              )}
              {data.shipment.notes && (
                <p className="text-xs text-muted-foreground border-t pt-2 mt-2">
                  {data.shipment.notes}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {data.address && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shipping address</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <div>{data.address.recipientName}</div>
              <div>{data.address.addressLine}</div>
              {data.address.addressLine2 && <div>{data.address.addressLine2}</div>}
              <div>
                {data.address.city}
                {data.address.province ? `, ${data.address.province}` : ""}{" "}
                {data.address.postalCode}
              </div>
              <div>{data.address.country}</div>
              {data.address.phone && (
                <div className="text-muted-foreground">
                  {data.address.phone}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {data.payment && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <Row label="Method" value={data.payment.method} />
              <Row
                label="Reference"
                value={
                  <span className="font-mono">{data.payment.reference}</span>
                }
              />
              <Row
                label="Amount"
                value={formatMoney(data.payment.amountCents)}
              />
              {data.payment.paidAt && (
                <Row label="Paid at" value={formatDateTime(data.payment.paidAt)} />
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-2">
          {showLoggedInCta && (
            <Button asChild variant="outline">
              <Link href={`/account/orders/${data.orderNumber}`}>
                View in account
              </Link>
            </Button>
          )}
          <Button asChild>
            <Link href="/products">Continue shopping</Link>
          </Button>
        </div>
      </aside>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
