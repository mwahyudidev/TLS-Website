import "server-only";
import { db } from "@/db/client";
import { deliverySchedules } from "@/db/schema";
import { eq } from "drizzle-orm";
import { errors } from "@/server/lib/errors";
import { z } from "zod";

export async function listActiveSchedules() {
  return db
    .select()
    .from(deliverySchedules)
    .where(eq(deliverySchedules.isActive, true))
    .orderBy(deliverySchedules.sortOrder)
    .all();
}

export async function listAllSchedules() {
  return db.select().from(deliverySchedules).orderBy(deliverySchedules.sortOrder).all();
}

export async function getSchedule(id: number) {
  const [s] = await db
    .select()
    .from(deliverySchedules)
    .where(eq(deliverySchedules.id, id))
    .all();
  if (!s) throw errors.notFound("Schedule not found");
  return s;
}

export const scheduleSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  label: z.string().min(1),
  cutoffTime: z.string().min(1),
  deliveryTime: z.string().min(1),
  areas: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export async function createSchedule(data: z.infer<typeof scheduleSchema>) {
  const [row] = await db.insert(deliverySchedules).values(data).returning();
  return row!;
}

export async function updateSchedule(id: number, data: Partial<z.infer<typeof scheduleSchema>>) {
  await getSchedule(id);
  const [row] = await db
    .update(deliverySchedules)
    .set({ ...data, updatedAt: Math.floor(Date.now() / 1000) })
    .where(eq(deliverySchedules.id, id))
    .returning();
  return row!;
}

export async function deleteSchedule(id: number) {
  await getSchedule(id);
  await db.delete(deliverySchedules).where(eq(deliverySchedules.id, id));
}
