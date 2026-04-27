import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { orders } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/admin/PageHeader";
import { OrderActionsPanel } from "@/components/admin/OrderActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TrackingTimeline } from "@/components/shared/TrackingTimeline";
import { getOrderDetail } from "@/server/modules/orders/service";
import { nextOrderStatuses } from "@/server/statusMachine/orderStatus";
import { formatDateTime, formatMoney, formatDate } from "@/lib/format";
import type { OrderStatus, ShippingStatus } from "@/db/schema";

const SHIPPING_NEXT: Record<ShippingStatus, ShippingStatus[]> = {
  not_shipped: ["preparing", "packed", "shipped"],
  preparing: ["packed", "shipped", "failed"],
  packed: ["shipped", "failed"],
  shipped: ["in_transit", "delivered", "failed", "returned"],
  in_transit: ["delivered", "failed", "returned"],
  delivered: ["returned"],
  failed: ["preparing", "shipped"],
  returned: [],
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) notFound();

  const orderRow = await db
    .select({ orderNumber: orders.orderNumber })
    .from(orders)
    .where(eq(orders.id, orderId))
    .get();
  if (!orderRow) notFound();

  const detail = await getOrderDetail(orderRow.orderNumber);
  const { order, items, address, payment, shipment, history } = detail;

  return (
    <div>
      <PageHeader
        title={order.orderNumber}
        description={`Placed ${formatDateTime(order.createdAt)} by ${order.customerName}`}
        back={{ label: "Back to orders", href: "/admin/orders" }}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Items</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {items.map((it) => (
                  <li
                    key={it.id}
                    className="py-3 flex justify-between items-start gap-3"
                  >
                    <div>
                      <div className="font-medium text-sm">{it.productName}</div>
                      <div className="text-xs text-muted-foreground">
                        SKU {it.productSku} · {it.quantity} ×{" "}
                        {formatMoney(it.unitPriceCents)}
                      </div>
                    </div>
                    <div className="text-sm font-semibold">
                      {formatMoney(it.lineSubtotalCents)}
                    </div>
                  </li>
                ))}
              </ul>
              <Separator className="my-3" />
              <div className="space-y-1.5 text-sm">
                <Row label="Subtotal" value={formatMoney(order.subtotalCents)} />
                {order.discountTotalCents > 0 && (
                  <Row
                    label={`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`}
                    value={`−${formatMoney(order.discountTotalCents)}`}
                  />
                )}
                <Row
                  label="Shipping"
                  value={
                    order.shippingTotalCents === 0
                      ? "Free"
                      : formatMoney(order.shippingTotalCents)
                  }
                />
                <Separator className="my-1" />
                <Row
                  label={<span className="font-semibold">Total</span>}
                  value={
                    <span className="font-semibold">
                      {formatMoney(order.grandTotalCents)}
                    </span>
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
              <Row label="Name" value={order.customerName} />
              <Row label="Email" value={order.customerEmail} />
              <Row label="Phone" value={order.customerPhone ?? "—"} />
              <Row
                label="Customer ID"
                value={order.customerId ? `#${order.customerId}` : "Guest"}
              />
            </CardContent>
          </Card>

          {address && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Shipping address</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <div>{address.recipientName}</div>
                <div>{address.addressLine}</div>
                {address.addressLine2 && <div>{address.addressLine2}</div>}
                <div>
                  {address.city}
                  {address.province ? `, ${address.province}` : ""}{" "}
                  {address.postalCode}
                </div>
                <div>{address.country}</div>
                {address.phone && (
                  <div className="text-muted-foreground">{address.phone}</div>
                )}
              </CardContent>
            </Card>
          )}

          {payment && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payment record</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <Row label="Method" value={payment.paymentMethod} />
                <Row label="Provider" value={payment.paymentProvider} />
                <Row
                  label="Reference"
                  value={
                    <span className="font-mono">
                      {payment.transactionReference}
                    </span>
                  }
                />
                <Row label="Amount" value={formatMoney(payment.amountCents)} />
                <Row label="Status" value={<StatusBadge status={payment.paymentStatus} />} />
                {payment.paidAt && (
                  <Row label="Paid at" value={formatDateTime(payment.paidAt)} />
                )}
                {payment.failedAt && (
                  <Row label="Failed at" value={formatDateTime(payment.failedAt)} />
                )}
                {payment.refundedAt && (
                  <Row
                    label="Refunded at"
                    value={formatDateTime(payment.refundedAt)}
                  />
                )}
                {payment.notes && (
                  <p className="text-xs text-muted-foreground border-t pt-2 mt-2">
                    {payment.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status history</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <TrackingTimeline
                events={history.map((h) => ({
                  type: h.statusType,
                  title: h.title,
                  description: h.description,
                  status: h.newStatus,
                  createdAt: h.createdAt,
                }))}
                orderStatus={order.orderStatus}
                paymentStatus={order.paymentStatus}
              />

              <div className="border-t pt-3">
                <h3 className="text-xs font-medium text-muted-foreground mb-2">
                  Full audit log
                </h3>
                <ul className="space-y-1.5 text-xs">
                  {history.map((h) => (
                    <li key={h.id} className="flex justify-between gap-3">
                      <span>
                        <span className="font-medium">[{h.statusType}]</span>{" "}
                        {h.oldStatus ?? "—"} → {h.newStatus} · {h.title}
                        {h.changedByRole && (
                          <span className="text-muted-foreground">
                            {" "}
                            ({h.changedByRole})
                          </span>
                        )}
                      </span>
                      <span className="text-muted-foreground shrink-0">
                        {formatDateTime(h.createdAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <OrderActionsPanel
          orderId={order.id}
          paymentId={payment?.id ?? null}
          shipmentId={shipment?.id ?? null}
          current={{
            orderStatus: order.orderStatus,
            paymentStatus: order.paymentStatus,
            shippingStatus: shipment?.shippingStatus ?? "not_shipped",
          }}
          shipment={{
            courierName: shipment?.courierName ?? null,
            shippingService: shipment?.shippingService ?? null,
            trackingNumber: shipment?.trackingNumber ?? null,
            shippingCostCents: shipment?.shippingCostCents ?? 0,
            estimatedDeliveryUnix: shipment?.estimatedDelivery ?? null,
            notes: shipment?.notes ?? null,
          }}
          nextOrderStatuses={nextOrderStatuses(order.orderStatus as OrderStatus)}
          nextShippingStatuses={
            shipment ? SHIPPING_NEXT[shipment.shippingStatus] : []
          }
        />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
