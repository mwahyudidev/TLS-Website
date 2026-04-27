import "server-only";
import { db } from "@/db/client";
import { weeklyPromos, weeklyPromoProducts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { errors } from "@/server/lib/errors";
import { z } from "zod";

export const promoSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  badgeText: z.string().optional(),
  validFrom: z.number().int(),
  validUntil: z.number().int(),
  status: z.enum(["active", "inactive"]).default("active"),
  sortOrder: z.number().int().default(0),
});

export async function listAdminPromos() {
  return db.select().from(weeklyPromos).orderBy(weeklyPromos.sortOrder).all();
}

export async function getAdminPromo(id: number) {
  const [promo] = await db
    .select()
    .from(weeklyPromos)
    .where(eq(weeklyPromos.id, id))
    .all();
  if (!promo) throw errors.notFound("Promo not found");
  return promo;
}

export async function createPromo(data: z.infer<typeof promoSchema>) {
  const [row] = await db.insert(weeklyPromos).values(data).returning();
  return row!;
}

export async function updatePromo(id: number, data: Partial<z.infer<typeof promoSchema>>) {
  await getAdminPromo(id);
  const [row] = await db
    .update(weeklyPromos)
    .set({ ...data, updatedAt: Math.floor(Date.now() / 1000) })
    .where(eq(weeklyPromos.id, id))
    .returning();
  return row!;
}

export async function deletePromo(id: number) {
  await getAdminPromo(id);
  await db.delete(weeklyPromos).where(eq(weeklyPromos.id, id));
}

export async function getPromoProductIds(promoId: number): Promise<number[]> {
  const rows = await db
    .select({ productId: weeklyPromoProducts.productId })
    .from(weeklyPromoProducts)
    .where(eq(weeklyPromoProducts.promoId, promoId))
    .orderBy(weeklyPromoProducts.sortOrder)
    .all();
  return rows.map((r) => r.productId);
}

export async function setPromoProducts(promoId: number, productIds: number[]): Promise<void> {
  await db.delete(weeklyPromoProducts).where(eq(weeklyPromoProducts.promoId, promoId));
  if (productIds.length === 0) return;
  await db.insert(weeklyPromoProducts).values(
    productIds.map((productId, idx) => ({ promoId, productId, sortOrder: idx })),
  );
}
