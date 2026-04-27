import "server-only";
import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { coupons, COUPON_TYPES } from "@/db/schema";
import { errors } from "@/server/lib/errors";

export const couponInputSchema = z.object({
  code: z.string().min(1).max(40).trim().toUpperCase(),
  type: z.enum(COUPON_TYPES),
  value: z.number().int().min(0),
  minimumOrderCents: z.number().int().min(0).default(0),
  usageLimit: z.number().int().min(1).nullable().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  startsAtUnix: z.number().int().min(0).nullable().optional(),
  expiresAtUnix: z.number().int().min(0).nullable().optional(),
});
export type CouponInput = z.infer<typeof couponInputSchema>;

export async function listAdminCoupons() {
  return db.select().from(coupons).orderBy(asc(coupons.code)).all();
}

export async function getAdminCoupon(id: number) {
  const c = await db.select().from(coupons).where(eq(coupons.id, id)).get();
  if (!c) throw errors.notFound("Coupon not found");
  return c;
}

export async function createCoupon(input: CouponInput) {
  const dup = await db
    .select({ id: coupons.id })
    .from(coupons)
    .where(eq(coupons.code, input.code))
    .get();
  if (dup) throw errors.conflict(`Coupon "${input.code}" already exists`);

  const [created] = await db
    .insert(coupons)
    .values({
      code: input.code,
      type: input.type,
      value: input.value,
      minimumOrderCents: input.minimumOrderCents,
      usageLimit: input.usageLimit ?? null,
      status: input.status,
      startsAt: input.startsAtUnix ?? null,
      expiresAt: input.expiresAtUnix ?? null,
    })
    .returning();
  return created!;
}

export async function updateCoupon(id: number, input: CouponInput) {
  await getAdminCoupon(id);
  await db
    .update(coupons)
    .set({
      code: input.code,
      type: input.type,
      value: input.value,
      minimumOrderCents: input.minimumOrderCents,
      usageLimit: input.usageLimit ?? null,
      status: input.status,
      startsAt: input.startsAtUnix ?? null,
      expiresAt: input.expiresAtUnix ?? null,
      updatedAt: Math.floor(Date.now() / 1000),
    })
    .where(eq(coupons.id, id));
  return { ok: true };
}

export async function deleteCoupon(id: number) {
  await db.delete(coupons).where(eq(coupons.id, id));
  return { ok: true };
}
