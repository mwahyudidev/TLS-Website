import "server-only";
import { desc, eq, like, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db/client";
import { customers, orders } from "@/db/schema";
import { errors } from "@/server/lib/errors";

export async function listAdminCustomers(opts: { q?: string; page?: number; perPage?: number }) {
  const page = Math.max(1, opts.page ?? 1);
  const perPage = Math.min(100, Math.max(1, opts.perPage ?? 25));

  const conds: SQL[] = [];
  if (opts.q) {
    const term = `%${opts.q.toLowerCase()}%`;
    conds.push(
      or(
        like(sql`lower(${customers.name})`, term),
        like(sql`lower(${customers.email})`, term),
      )!,
    );
  }

  const rows = await db
    .select({
      id: customers.id,
      name: customers.name,
      email: customers.email,
      phone: customers.phone,
      createdAt: customers.createdAt,
    })
    .from(customers)
    .where(conds.length ? conds[0] : undefined)
    .orderBy(desc(customers.createdAt))
    .limit(perPage)
    .offset((page - 1) * perPage)
    .all();

  // Hydrate order count + total spent
  const data = await Promise.all(
    rows.map(async (c) => {
      const stats = await db
        .select({
          orderCount: sql<number>`count(*)`,
          totalSpent: sql<number>`coalesce(sum(case when ${orders.paymentStatus} = 'paid' then ${orders.grandTotalCents} else 0 end), 0)`,
        })
        .from(orders)
        .where(eq(orders.customerId, c.id))
        .get();
      return {
        ...c,
        orderCount: stats?.orderCount ?? 0,
        totalSpentCents: stats?.totalSpent ?? 0,
      };
    }),
  );

  const total = await db
    .select({ c: sql<number>`count(*)` })
    .from(customers)
    .where(conds.length ? conds[0] : undefined)
    .get();

  return {
    data,
    meta: {
      page,
      perPage,
      total: total?.c ?? 0,
      totalPages: Math.ceil((total?.c ?? 0) / perPage),
    },
  };
}

export async function getAdminCustomer(id: number) {
  const c = await db.select().from(customers).where(eq(customers.id, id)).get();
  if (!c) throw errors.notFound("Customer not found");

  const orderRows = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      grandTotalCents: orders.grandTotalCents,
      orderStatus: orders.orderStatus,
      paymentStatus: orders.paymentStatus,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.customerId, id))
    .orderBy(desc(orders.createdAt))
    .all();

  return { customer: c, orders: orderRows };
}
