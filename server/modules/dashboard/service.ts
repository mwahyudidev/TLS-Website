import "server-only";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { orders, products, customers, payments } from "@/db/schema";
import { getLowStockThreshold } from "@/server/modules/settings/service";

export async function getDashboardStats() {
  const [
    totalOrders,
    pendingOrders,
    paidOrders,
    shippedOrders,
    completedOrders,
    cancelledOrders,
    totalProducts,
    activeProducts,
    totalCustomers,
    salesAgg,
  ] = await Promise.all([
    db.select({ c: sql<number>`count(*)` }).from(orders).get(),
    db
      .select({ c: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.orderStatus, "pending"))
      .get(),
    db
      .select({ c: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.paymentStatus, "paid"))
      .get(),
    db
      .select({ c: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.orderStatus, "shipped"))
      .get(),
    db
      .select({ c: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.orderStatus, "completed"))
      .get(),
    db
      .select({ c: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.orderStatus, "cancelled"))
      .get(),
    db.select({ c: sql<number>`count(*)` }).from(products).get(),
    db
      .select({ c: sql<number>`count(*)` })
      .from(products)
      .where(eq(products.status, "active"))
      .get(),
    db.select({ c: sql<number>`count(*)` }).from(customers).get(),
    db
      .select({
        sum: sql<number>`coalesce(sum(${orders.grandTotalCents}), 0)`,
      })
      .from(orders)
      .where(eq(orders.paymentStatus, "paid"))
      .get(),
  ]);

  return {
    totalSalesCents: salesAgg?.sum ?? 0,
    totalOrders: totalOrders?.c ?? 0,
    pendingOrders: pendingOrders?.c ?? 0,
    paidOrders: paidOrders?.c ?? 0,
    shippedOrders: shippedOrders?.c ?? 0,
    completedOrders: completedOrders?.c ?? 0,
    cancelledOrders: cancelledOrders?.c ?? 0,
    totalProducts: totalProducts?.c ?? 0,
    activeProducts: activeProducts?.c ?? 0,
    totalCustomers: totalCustomers?.c ?? 0,
  };
}

export async function getRecentOrders(limit = 8) {
  return db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      customerName: orders.customerName,
      customerEmail: orders.customerEmail,
      grandTotalCents: orders.grandTotalCents,
      orderStatus: orders.orderStatus,
      paymentStatus: orders.paymentStatus,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .all();
}

export async function getLowStockProducts(limit = 8) {
  const threshold = await getLowStockThreshold();
  return db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      sku: products.sku,
      stock: products.stock,
      status: products.status,
    })
    .from(products)
    .where(
      and(
        eq(products.status, "active"),
        lte(products.stock, threshold),
      ),
    )
    .orderBy(products.stock)
    .limit(limit)
    .all();
}

export async function getRecentPayments(limit = 8) {
  return db
    .select({
      id: payments.id,
      orderId: payments.orderId,
      paymentMethod: payments.paymentMethod,
      paymentStatus: payments.paymentStatus,
      amountCents: payments.amountCents,
      transactionReference: payments.transactionReference,
      createdAt: payments.createdAt,
      orderNumber: orders.orderNumber,
    })
    .from(payments)
    .innerJoin(orders, eq(orders.id, payments.orderId))
    .orderBy(desc(payments.createdAt))
    .limit(limit)
    .all();
}
