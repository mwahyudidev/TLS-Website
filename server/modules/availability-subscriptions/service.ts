import "server-only";
import { db } from "@/db/client";
import { availabilitySubscriptions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { errors } from "@/server/lib/errors";

export async function submitAvailabilitySubscription(data: {
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  productId?: number | null;
  categoryId?: number | null;
  subscriptionType: "back_in_stock" | "new_arrival" | "category_alert" | "general_update";
  notes?: string | null;
}) {
  const now = Math.floor(Date.now() / 1000);
  const [row] = await db
    .insert(availabilitySubscriptions)
    .values({ ...data, createdAt: now, updatedAt: now })
    .returning();
  return row!;
}

export async function listAvailabilitySubscriptions() {
  return db
    .select()
    .from(availabilitySubscriptions)
    .orderBy(desc(availabilitySubscriptions.createdAt));
}

export async function getAvailabilitySubscription(id: number) {
  const [row] = await db
    .select()
    .from(availabilitySubscriptions)
    .where(eq(availabilitySubscriptions.id, id));
  if (!row) throw errors.notFound("Availability subscription");
  return row;
}

export async function updateAvailabilitySubscription(
  id: number,
  data: { status?: "pending" | "notified" | "cancelled"; notes?: string | null },
) {
  const now = Math.floor(Date.now() / 1000);
  const [row] = await db
    .update(availabilitySubscriptions)
    .set({ ...data, updatedAt: now })
    .where(eq(availabilitySubscriptions.id, id))
    .returning();
  if (!row) throw errors.notFound("Availability subscription");
  return row;
}

export async function deleteAvailabilitySubscription(id: number) {
  await db
    .delete(availabilitySubscriptions)
    .where(eq(availabilitySubscriptions.id, id));
}
