import "server-only";
import { db } from "@/db/client";
import { contactMessages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { errors } from "@/server/lib/errors";
import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(2000),
});

export async function submitContactMessage(data: z.infer<typeof contactSchema>) {
  const [row] = await db
    .insert(contactMessages)
    .values({ ...data, status: "new" })
    .returning();
  return row!;
}

export async function listContactMessages() {
  return db.select().from(contactMessages).orderBy(contactMessages.createdAt).all();
}

export async function getContactMessage(id: number) {
  const [msg] = await db
    .select()
    .from(contactMessages)
    .where(eq(contactMessages.id, id))
    .all();
  if (!msg) throw errors.notFound("Message not found");
  return msg;
}

export async function updateMessageStatus(
  id: number,
  status: "new" | "read" | "replied" | "archived",
) {
  await getContactMessage(id);
  const [row] = await db
    .update(contactMessages)
    .set({ status, updatedAt: Math.floor(Date.now() / 1000) })
    .where(eq(contactMessages.id, id))
    .returning();
  return row!;
}
