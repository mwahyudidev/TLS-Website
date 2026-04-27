import "server-only";
import { db } from "@/db/client";
import { newsletterSubscribers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { errors } from "@/server/lib/errors";
import { z } from "zod";

export const subscribeSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

export async function subscribe(data: z.infer<typeof subscribeSchema>) {
  const now = Math.floor(Date.now() / 1000);
  const existing = await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, data.email.toLowerCase().trim()))
    .all();

  if (existing[0]) {
    if (existing[0].status === "active") {
      return { alreadySubscribed: true, subscriber: existing[0] };
    }
    // Re-subscribe
    const [row] = await db
      .update(newsletterSubscribers)
      .set({ status: "active", unsubscribedAt: null, subscribedAt: now, updatedAt: now })
      .where(eq(newsletterSubscribers.id, existing[0].id))
      .returning();
    return { alreadySubscribed: false, subscriber: row! };
  }

  const [row] = await db
    .insert(newsletterSubscribers)
    .values({
      email: data.email.toLowerCase().trim(),
      name: data.name,
      status: "active",
      subscribedAt: now,
    })
    .returning();
  return { alreadySubscribed: false, subscriber: row! };
}

export async function unsubscribe(email: string) {
  const now = Math.floor(Date.now() / 1000);
  const [existing] = await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, email.toLowerCase().trim()))
    .all();
  if (!existing) throw errors.notFound("Subscriber not found");
  await db
    .update(newsletterSubscribers)
    .set({ status: "unsubscribed", unsubscribedAt: now, updatedAt: now })
    .where(eq(newsletterSubscribers.id, existing.id));
}

export async function listSubscribers() {
  return db.select().from(newsletterSubscribers).orderBy(newsletterSubscribers.subscribedAt).all();
}
