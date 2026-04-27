import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PaymentInstructionsCard } from "@/components/storefront/PaymentInstructionsCard";
import { getOrderDetail } from "@/server/modules/orders/service";
import { formatMoney, formatDateTime } from "@/lib/format";
import { AppError } from "@/server/lib/errors";

export default async function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  let detail;
  try {
    detail = await getOrderDetail(orderNumber);
  } catch (e) {
    if (e instanceof AppError && e.code === "NOT_FOUND") notFound();
    throw e;
  }
  const { order, items, address, payment } = detail;

  return (
    <div className="container py-12 max-w-3xl">
      <div className="text-center mb-10">
        <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-600" />
        <h1 className="text-3xl font-semibold tracking-tight mt-3">
          Order placed
        </h1>
        <p className="text-muted-foreground text-sm mt-2">
          Thank you, {order.customerName}. Your order has been saved.
        </p>
        <div className="mt-4 inline-flex items-center gap-3">
          <span className="font-mono text-sm rounded-md border bg-card px-3 py-1.5">
            {order.orderNumber}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Status</CardTitle>
            <Link
              href={`/track-order/${order.orderNumber}?email=${encodeURIComponent(order.customerEmail)}`}
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center"
            >
              Track order <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <div>
              <div className="text-xs text-muted-foreground">Order</div>
              <StatusBadge status={order.orderStatus} className="mt-1" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Payment</div>
              <StatusBadge status={order.paymentStatus} className="mt-1" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Placed</div>
              <div className="text-sm">{formatDateTime(order.createdAt)}</div>
            </div>
          </CardContent>
        </Card>

        {payment && (
          <PaymentInstructionsCard
            title={`Payment — ${payment.paymentMethod}`}
            body={`Reference: ${payment.transactionReference}\nAmount: ${formatMoney(payment.amountCents)}\n\nReal payment gateway is not active. The store admin will manually mark this order as paid.`}
            reference={payment.transactionReference}
            amountCents={payment.amountCents}
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ul className="space-y-2">
              {items.map((it) => (
                <li key={it.id} className="flex justify-between gap-3">
                  <span>
                    {it.quantity} × {it.productName}
                  </span>
                  <span>{formatMoney(it.lineSubtotalCents)}</span>
                </li>
              ))}
            </ul>
            <Separator />
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatMoney(order.subtotalCents)}</span>
              </div>
              {order.discountTotalCents > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span>−{formatMoney(order.discountTotalCents)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {order.shippingTotalCents === 0
                    ? "Free"
                    : formatMoney(order.shippingTotalCents)}
                </span>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatMoney(order.grandTotalCents)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {address && (
          <Card>
            <CardHeader>
              <CardTitle>Shipping to</CardTitle>
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

        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <Button asChild size="lg">
            <Link
              href={`/track-order/${order.orderNumber}?email=${encodeURIComponent(order.customerEmail)}`}
            >
              Track this order
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/products">Continue shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
