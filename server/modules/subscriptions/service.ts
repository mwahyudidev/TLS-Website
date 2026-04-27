import "server-only";
import { db } from "@/db/client";
import { subscriptionPlans } from "@/db/schema";
import { eq } from "drizzle-orm";
import { errors } from "@/server/lib/errors";

export async function listActivePlans() {
  return db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.status, "active"))
    .orderBy(subscriptionPlans.sortOrder)
    .all();
}

export async function getPlan(id: number) {
  const [plan] = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.id, id))
    .all();
  if (!plan) throw errors.notFound("Plan not found");
  return plan;
}
