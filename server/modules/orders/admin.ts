import "server-only";
import { and, desc, eq, gte, like, lte, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db/client";
import {
  orders,
  orderStatusHistory,
  type OrderStatus,
  type PaymentStatus,
  type ShippingStatus,
} from "@/db/schema";
import { errors } from "@/server/lib/errors";
import { assertOrderTransition } from "@/server/statusMachine/orderStatus";
import type { AuthUser } from "@/server/lib/session";

export type AdminOrderListOpts = {
  status?: OrderStatus;
  payment?: PaymentStatus;
  shipping?: ShippingStatus;
  fromUnix?: number;
  toUnix?: number;
  q?: string;
  page?: number;
  perPage?: number;
};

export async function listAdminOrders(opts: AdminOrderListOpts = {}) {
  const page = Math.max(1, opts.page ?? 1);
  const perPage = Math.min(100, Math.max(1, opts.perPage ?? 25));
  const conds: SQL[] = [];
  if (opts.status) conds.push(eq(orders.orderStatus, opts.status));
  if (opts.payment) conds.push(eq(orders.paymentStatus, opts.payment));
  if (opts.fromUnix) conds.push(gte(orders.createdAt, opts.fromUnix));
  if (opts.toUnix) conds.push(lte(orders.createdAt, opts.toUnix));
  if (opts.q) {
    const term = `%${opts.q.toLowerCase()}%`;
    conds.push(
      or(
        like(sql`lower(${orders.orderNumber})`, term),
        like(sql`lower(${orders.customerEmail})`, term),
        like(sql`lower(${orders.customerName})`, term),
      )!,
    );
  }

  const rows = await db
    .select()
    .from(orders)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(orders.createdAt))
    .limit(perPage)
    .offset((page - 1) * perPage)
    .all();

  const totalRow = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(conds.length ? and(...conds) : undefined)
    .get();

  return {
    data: rows,
    meta: {
      page,
      perPage,
      total: totalRow?.count ?? 0,
      totalPages: Math.ceil((totalRow?.count ?? 0) / perPage),
    },
  };
}

export async function setOrderStatus(
  orderId: number,
  newStatus: OrderStatus,
  ctx: { by: AuthUser; notes?: string },
) {
  const order = await db.select().from(orders).where(eq(orders.id, orderId)).get();
  if (!order) throw errors.notFound("Order not found");
  assertOrderTransition(order.orderStatus, newStatus);

  const nowSec = Math.floor(Date.now() / 1000);
  await db.transaction(async (tx) => {
    tx.update(orders)
      .set({ orderStatus: newStatus, updatedAt: nowSec })
      .where(eq(orders.id, orderId))
      .run();

    tx.insert(orderStatusHistory)
      .values({
        orderId,
        statusType: "order",
        oldStatus: order.orderStatus,
        newStatus,
        title: titleFor(newStatus),
        description: ctx.notes ?? `Updated by ${ctx.by.name}`,
        changedByUserId: ctx.by.id,
        changedByRole: ctx.by.role,
        createdAt: nowSec,
      })
      .run();
  });
  return { ok: true };
}

export async function cancelOrder(
  orderId: number,
  ctx: { by: AuthUser; notes?: string },
) {
  return setOrderStatus(orderId, "cancelled", ctx);
}

export async function addManualHistoryNote(
  orderId: number,
  input: { title: string; description?: string },
  ctx: { by: AuthUser },
) {
  const order = await db.select().from(orders).where(eq(orders.id, orderId)).get();
  if (!order) throw errors.notFound("Order not found");
  await db.insert(orderStatusHistory).values({
    orderId,
    statusType: "order",
    oldStatus: order.orderStatus,
    newStatus: order.orderStatus,
    title: input.title,
    description: input.description,
    changedByUserId: ctx.by.id,
    changedByRole: ctx.by.role,
  });
  return { ok: true };
}

function titleFor(s: OrderStatus): string {
  return {
    pending: "Order pending",
    processing: "Order processing",
    packed: "Order packed",
    shipped: "Order shipped",
    delivered: "Order delivered",
    completed: "Order completed",
    cancelled: "Order cancelled",
    refunded: "Order refunded",
  }[s];
}
