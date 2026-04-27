import "server-only";
import { db } from "@/db/client";
import { subscriptionPlans, customerSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { errors } from "@/server/lib/errors";
import { z } from "zod";

export const planSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  frequency: z.enum(["weekly", "biweekly", "monthly"]),
  priceCents: z.number().int().min(0),
  discountPercent: z.number().int().min(0).max(100).default(0),
  features: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  sortOrder: z.number().int().default(0),
});

export async function listAdminPlans() {
  return db.select().from(subscriptionPlans).orderBy(subscriptionPlans.sortOrder).all();
}

export async function getAdminPlan(id: number) {
  const [plan] = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.id, id))
    .all();
  if (!plan) throw errors.notFound("Plan not found");
  return plan;
}

export async function createPlan(data: z.infer<typeof planSchema>) {
  const [row] = await db.insert(subscriptionPlans).values(data).returning();
  return row!;
}

export async function updatePlan(id: number, data: Partial<z.infer<typeof planSchema>>) {
  await getAdminPlan(id);
  const [row] = await db
    .update(subscriptionPlans)
    .set({ ...data, updatedAt: Math.floor(Date.now() / 1000) })
    .where(eq(subscriptionPlans.id, id))
    .returning();
  return row!;
}

export async function deletePlan(id: number) {
  await getAdminPlan(id);
  await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id));
}

export async function listCustomerSubscriptions() {
  return db.select().from(customerSubscriptions).orderBy(customerSubscriptions.createdAt).all();
}
