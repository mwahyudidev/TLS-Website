import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { coupons } from "@/db/schema";
import { errors } from "@/server/lib/errors";

export type AppliedCoupon = {
  code: string;
  discountCents: number;
  description: string;
};

export async function applyCoupon(
  code: string,
  subtotalCents: number,
): Promise<AppliedCoupon> {
  const c = await db
    .select()
    .from(coupons)
    .where(eq(coupons.code, code.toUpperCase().trim()))
    .get();
  if (!c || c.status !== "active") {
    throw errors.validation("Invalid coupon code");
  }
  const now = Math.floor(Date.now() / 1000);
  if (c.startsAt && c.startsAt > now) {
    throw errors.validation("Coupon is not active yet");
  }
  if (c.expiresAt && c.expiresAt < now) {
    throw errors.validation("Coupon has expired");
  }
  if (c.usageLimit !== null && c.usedCount >= c.usageLimit) {
    throw errors.validation("Coupon usage limit reached");
  }
  if (subtotalCents < c.minimumOrderCents) {
    throw errors.validation(
      `Minimum order amount for this coupon is ${(c.minimumOrderCents / 100).toFixed(2)}`,
    );
  }

  let discountCents: number;
  if (c.type === "percentage") {
    // value is basis-points / 100 (e.g. 1000 = 10.00%)
    discountCents = Math.floor((subtotalCents * c.value) / 10000);
  } else {
    discountCents = Math.min(c.value, subtotalCents);
  }

  return {
    code: c.code,
    discountCents,
    description:
      c.type === "percentage"
        ? `${(c.value / 100).toFixed(2)}% off`
        : `$${(c.value / 100).toFixed(2)} off`,
  };
}

export async function recordCouponUse(code: string) {
  const c = await db
    .select({ id: coupons.id, usedCount: coupons.usedCount })
    .from(coupons)
    .where(eq(coupons.code, code))
    .get();
  if (!c) return;
  await db
    .update(coupons)
    .set({
      usedCount: c.usedCount + 1,
      updatedAt: Math.floor(Date.now() / 1000),
    })
    .where(eq(coupons.id, c.id));
}
