import "server-only";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  payments,
  orders,
  orderItems,
  products,
  orderStatusHistory,
  type PaymentStatus,
  type OrderStatus,
} from "@/db/schema";
import { errors } from "@/server/lib/errors";
import { assertPaymentTransition } from "@/server/statusMachine/paymentStatus";
import { assertOrderTransition } from "@/server/statusMachine/orderStatus";
import type { AuthUser } from "@/server/lib/session";

type ChangeContext = {
  by: AuthUser;
  notes?: string;
};

async function loadPaymentAndOrder(paymentId: number) {
  const payment = await db
    .select()
    .from(payments)
    .where(eq(payments.id, paymentId))
    .get();
  if (!payment) throw errors.notFound("Payment not found");
  const order = await db
    .select()
    .from(orders)
    .where(eq(orders.id, payment.orderId))
    .get();
  if (!order) throw errors.notFound("Order not found");
  return { payment, order };
}

export async function markPaid(paymentId: number, ctx: ChangeContext) {
  const { payment, order } = await loadPaymentAndOrder(paymentId);
  if (payment.paymentStatus === "paid") {
    throw errors.conflict("Payment is already marked as paid");
  }
  assertPaymentTransition(payment.paymentStatus, "paid");

  // Decrement stock atomically. If any item exceeds stock, fail.
  db.transaction((tx) => {
    const items = tx
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id))
      .all();

    for (const it of items) {
      if (!it.productId) continue; // product was deleted; skip stock decrement
      const updated = tx.run(
        sql`UPDATE products
            SET stock = stock - ${it.quantity},
                updated_at = unixepoch()
            WHERE id = ${it.productId} AND stock >= ${it.quantity}`,
      );
      if (updated.changes === 0) {
        // Either product missing or insufficient stock
        const p = tx
          .select({ stock: products.stock, name: products.name })
          .from(products)
          .where(eq(products.id, it.productId))
          .get();
        throw errors.stockUnavailable(
          p?.name ?? it.productName,
          p?.stock ?? 0,
        );
      }
    }

    const nowSec = Math.floor(Date.now() / 1000);
    tx.update(payments)
      .set({
        paymentStatus: "paid",
        paidAt: nowSec,
        notes: ctx.notes ?? payment.notes,
        updatedAt: nowSec,
      })
      .where(eq(payments.id, payment.id))
      .run();

    // Order: payment_status -> paid, order_status -> processing if it was pending
    const newOrderStatus: OrderStatus =
      order.orderStatus === "pending" ? "processing" : order.orderStatus;
    if (newOrderStatus !== order.orderStatus) {
      assertOrderTransition(order.orderStatus, newOrderStatus);
    }

    tx.update(orders)
      .set({
        paymentStatus: "paid",
        orderStatus: newOrderStatus,
        updatedAt: nowSec,
      })
      .where(eq(orders.id, order.id))
      .run();

    tx.insert(orderStatusHistory)
      .values([
        {
          orderId: order.id,
          statusType: "payment",
          oldStatus: payment.paymentStatus,
          newStatus: "paid",
          title: "Payment confirmed",
          description: `Marked paid by ${ctx.by.name}`,
          changedByUserId: ctx.by.id,
          changedByRole: ctx.by.role,
          createdAt: nowSec,
        },
        ...(newOrderStatus !== order.orderStatus
          ? [
              {
                orderId: order.id,
                statusType: "order" as const,
                oldStatus: order.orderStatus,
                newStatus: newOrderStatus,
                title: "Order moved to processing",
                description: "Payment received — order is now being processed",
                changedByUserId: ctx.by.id,
                changedByRole: ctx.by.role,
                createdAt: nowSec,
              },
            ]
          : []),
      ])
      .run();
  });

  return { ok: true };
}

export async function markFailed(paymentId: number, ctx: ChangeContext) {
  const { payment, order } = await loadPaymentAndOrder(paymentId);
  assertPaymentTransition(payment.paymentStatus, "failed");

  const nowSec = Math.floor(Date.now() / 1000);
  await db.transaction(async (tx) => {
    tx.update(payments)
      .set({
        paymentStatus: "failed",
        failedAt: nowSec,
        notes: ctx.notes ?? payment.notes,
        updatedAt: nowSec,
      })
      .where(eq(payments.id, payment.id))
      .run();

    tx.update(orders)
      .set({ paymentStatus: "failed", updatedAt: nowSec })
      .where(eq(orders.id, order.id))
      .run();

    tx.insert(orderStatusHistory)
      .values({
        orderId: order.id,
        statusType: "payment",
        oldStatus: payment.paymentStatus,
        newStatus: "failed",
        title: "Payment failed",
        description: ctx.notes ?? `Marked failed by ${ctx.by.name}`,
        changedByUserId: ctx.by.id,
        changedByRole: ctx.by.role,
        createdAt: nowSec,
      })
      .run();
  });

  return { ok: true };
}

export async function cancelPayment(paymentId: number, ctx: ChangeContext) {
  const { payment, order } = await loadPaymentAndOrder(paymentId);
  assertPaymentTransition(payment.paymentStatus, "cancelled");

  const nowSec = Math.floor(Date.now() / 1000);
  await db.transaction(async (tx) => {
    tx.update(payments)
      .set({
        paymentStatus: "cancelled",
        cancelledAt: nowSec,
        notes: ctx.notes ?? payment.notes,
        updatedAt: nowSec,
      })
      .where(eq(payments.id, payment.id))
      .run();

    tx.update(orders)
      .set({
        paymentStatus: "cancelled",
        orderStatus: "cancelled",
        updatedAt: nowSec,
      })
      .where(eq(orders.id, order.id))
      .run();

    tx.insert(orderStatusHistory)
      .values([
        {
          orderId: order.id,
          statusType: "payment",
          oldStatus: payment.paymentStatus,
          newStatus: "cancelled",
          title: "Payment cancelled",
          description: ctx.notes ?? `Cancelled by ${ctx.by.name}`,
          changedByUserId: ctx.by.id,
          changedByRole: ctx.by.role,
          createdAt: nowSec,
        },
        {
          orderId: order.id,
          statusType: "order",
          oldStatus: order.orderStatus,
          newStatus: "cancelled",
          title: "Order cancelled",
          description: "Payment cancelled before completion",
          changedByUserId: ctx.by.id,
          changedByRole: ctx.by.role,
          createdAt: nowSec,
        },
      ])
      .run();
  });
  return { ok: true };
}

// Refund simulation: restock products and mark refunded.
export async function refundSimulation(paymentId: number, ctx: ChangeContext) {
  const { payment, order } = await loadPaymentAndOrder(paymentId);
  if (payment.paymentStatus !== "paid") {
    throw errors.conflict("Only paid payments can be refunded");
  }
  assertPaymentTransition(payment.paymentStatus, "refunded");

  const nowSec = Math.floor(Date.now() / 1000);
  db.transaction((tx) => {
    // Restock items
    const items = tx
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id))
      .all();
    for (const it of items) {
      if (!it.productId) continue;
      tx.run(
        sql`UPDATE products
            SET stock = stock + ${it.quantity}, updated_at = unixepoch()
            WHERE id = ${it.productId}`,
      );
    }

    tx.update(payments)
      .set({
        paymentStatus: "refunded",
        refundedAt: nowSec,
        notes: ctx.notes ?? payment.notes,
        updatedAt: nowSec,
      })
      .where(eq(payments.id, payment.id))
      .run();

    tx.update(orders)
      .set({
        paymentStatus: "refunded",
        orderStatus: "refunded",
        updatedAt: nowSec,
      })
      .where(eq(orders.id, order.id))
      .run();

    tx.insert(orderStatusHistory)
      .values([
        {
          orderId: order.id,
          statusType: "payment",
          oldStatus: "paid",
          newStatus: "refunded",
          title: "Refund issued (simulation)",
          description: ctx.notes ?? `Refunded by ${ctx.by.name}`,
          changedByUserId: ctx.by.id,
          changedByRole: ctx.by.role,
          createdAt: nowSec,
        },
        {
          orderId: order.id,
          statusType: "order",
          oldStatus: order.orderStatus,
          newStatus: "refunded",
          title: "Order refunded",
          description: "Stock restored",
          changedByUserId: ctx.by.id,
          changedByRole: ctx.by.role,
          createdAt: nowSec,
        },
      ])
      .run();
  });

  return { ok: true };
}

export async function setPaymentStatus(
  paymentId: number,
  newStatus: PaymentStatus,
  ctx: ChangeContext,
) {
  switch (newStatus) {
    case "paid":
      return markPaid(paymentId, ctx);
    case "failed":
      return markFailed(paymentId, ctx);
    case "cancelled":
      return cancelPayment(paymentId, ctx);
    case "refunded":
      return refundSimulation(paymentId, ctx);
    default:
      throw errors.validation(`Cannot directly set status to ${newStatus}`);
  }
}
