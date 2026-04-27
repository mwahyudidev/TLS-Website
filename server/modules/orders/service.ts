import "server-only";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  orders,
  orderItems,
  payments,
  shipments,
  shippingAddresses,
  orderStatusHistory,
  customers,
} from "@/db/schema";
import { errors } from "@/server/lib/errors";

export type OrderDetail = Awaited<ReturnType<typeof getOrderDetail>>;

export async function getOrderDetail(orderNumber: string) {
  const order = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .get();
  if (!order) throw errors.notFound("Order not found");

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

  const payment = await db
    .select()
    .from(payments)
    .where(eq(payments.orderId, order.id))
    .orderBy(desc(payments.id))
    .get();

  const shipment = await db
    .select()
    .from(shipments)
    .where(eq(shipments.orderId, order.id))
    .get();

  const history = await db
    .select()
    .from(orderStatusHistory)
    .where(eq(orderStatusHistory.orderId, order.id))
    .orderBy(asc(orderStatusHistory.createdAt), asc(orderStatusHistory.id))
    .all();

  return { order, items, address, payment, shipment, history };
}

export async function getOrderForCustomer(
  orderNumber: string,
  email: string,
): Promise<OrderDetail> {
  const detail = await getOrderDetail(orderNumber);
  if (
    detail.order.customerEmail.toLowerCase().trim() !==
    email.toLowerCase().trim()
  ) {
    throw errors.notFound("Order not found");
  }
  return detail;
}

export async function getOrdersByUser(userId: number) {
  // Look up customer record(s) for this user
  const cust = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.userId, userId))
    .get();
  if (!cust) return [];

  const rows = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      orderStatus: orders.orderStatus,
      paymentStatus: orders.paymentStatus,
      grandTotalCents: orders.grandTotalCents,
      createdAt: orders.createdAt,
      itemId: orderItems.id,
    })
    .from(orders)
    .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
    .where(eq(orders.customerId, cust.id))
    .orderBy(desc(orders.createdAt))
    .all();

  const map = new Map<
    string,
    {
      id: number;
      orderNumber: string;
      orderStatus: string;
      paymentStatus: string;
      grandTotalCents: number;
      createdAt: number;
      itemCount: number;
    }
  >();
  for (const r of rows) {
    const existing = map.get(r.orderNumber);
    if (existing) {
      if (r.itemId) existing.itemCount += 1;
    } else {
      map.set(r.orderNumber, {
        id: r.id,
        orderNumber: r.orderNumber,
        orderStatus: r.orderStatus,
        paymentStatus: r.paymentStatus,
        grandTotalCents: r.grandTotalCents,
        createdAt: r.createdAt,
        itemCount: r.itemId ? 1 : 0,
      });
    }
  }
  return Array.from(map.values());
}

export async function getOrderForUser(orderNumber: string, userId: number) {
  const cust = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.userId, userId))
    .get();
  if (!cust) throw errors.notFound("Order not found");

  const detail = await getOrderDetail(orderNumber);
  if (detail.order.customerId !== cust.id) {
    throw errors.notFound("Order not found");
  }
  return detail;
}
