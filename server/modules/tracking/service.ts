import "server-only";
import { eq, asc } from "drizzle-orm";
import { db } from "@/db/client";
import {
  orders,
  orderItems,
  payments,
  shipments,
  shippingAddresses,
  orderStatusHistory,
} from "@/db/schema";
import { errors } from "@/server/lib/errors";

// Public tracking payload — sanitized for customer eyes only.
export type PublicTracking = {
  orderNumber: string;
  createdAt: number;
  customerName: string;
  customerEmail: string; // shown back so customer knows which order
  orderStatus: string;
  paymentStatus: string;
  shippingStatus: string;
  subtotalCents: number;
  discountTotalCents: number;
  shippingTotalCents: number;
  grandTotalCents: number;
  currency: string;
  items: Array<{
    name: string;
    sku: string;
    quantity: number;
    unitPriceCents: number;
    lineSubtotalCents: number;
  }>;
  address: {
    recipientName: string;
    addressLine: string;
    addressLine2: string | null;
    city: string;
    province: string | null;
    postalCode: string;
    country: string;
    phone: string | null;
  } | null;
  shipment: {
    courierName: string | null;
    shippingService: string | null;
    trackingNumber: string | null;
    estimatedDelivery: number | null;
    shippedAt: number | null;
    deliveredAt: number | null;
    notes: string | null;
  } | null;
  payment: {
    method: string;
    reference: string;
    amountCents: number;
    paidAt: number | null;
  } | null;
  timeline: Array<{
    type: "order" | "payment" | "shipping";
    title: string;
    description: string | null;
    status: string;
    createdAt: number;
  }>;
};

export async function getTrackingPayload(
  orderNumber: string,
  email: string,
): Promise<PublicTracking> {
  const order = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .get();

  // generic 404 to avoid existence/non-existence enumeration
  const generic404 = errors.notFound("Order not found");

  if (!order) throw generic404;
  if (
    order.customerEmail.toLowerCase().trim() !== email.toLowerCase().trim()
  ) {
    throw generic404;
  }

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id))
    .orderBy(asc(orderItems.id))
    .all();

  const address = await db
    .select()
    .from(shippingAddresses)
    .where(eq(shippingAddresses.orderId, order.id))
    .get();

  const shipment = await db
    .select()
    .from(shipments)
    .where(eq(shipments.orderId, order.id))
    .get();

  const payment = await db
    .select()
    .from(payments)
    .where(eq(payments.orderId, order.id))
    .get();

  const history = await db
    .select()
    .from(orderStatusHistory)
    .where(eq(orderStatusHistory.orderId, order.id))
    .orderBy(asc(orderStatusHistory.createdAt), asc(orderStatusHistory.id))
    .all();

  return {
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    shippingStatus: shipment?.shippingStatus ?? "not_shipped",
    subtotalCents: order.subtotalCents,
    discountTotalCents: order.discountTotalCents,
    shippingTotalCents: order.shippingTotalCents,
    grandTotalCents: order.grandTotalCents,
    currency: order.currency,
    items: items.map((it) => ({
      name: it.productName,
      sku: it.productSku,
      quantity: it.quantity,
      unitPriceCents: it.unitPriceCents,
      lineSubtotalCents: it.lineSubtotalCents,
    })),
    address: address
      ? {
          recipientName: address.recipientName,
          addressLine: address.addressLine,
          addressLine2: address.addressLine2,
          city: address.city,
          province: address.province,
          postalCode: address.postalCode,
          country: address.country,
          phone: address.phone,
        }
      : null,
    shipment: shipment
      ? {
          courierName: shipment.courierName,
          shippingService: shipment.shippingService,
          trackingNumber: shipment.trackingNumber,
          estimatedDelivery: shipment.estimatedDelivery,
          shippedAt: shipment.shippedAt,
          deliveredAt: shipment.deliveredAt,
          notes: shipment.notes,
        }
      : null,
    payment: payment
      ? {
          method: payment.paymentMethod,
          reference: payment.transactionReference,
          amountCents: payment.amountCents,
          paidAt: payment.paidAt,
        }
      : null,
    timeline: history.map((h) => ({
      type: h.statusType,
      title: h.title,
      description: h.description,
      status: h.newStatus,
      createdAt: h.createdAt,
    })),
  };
}
