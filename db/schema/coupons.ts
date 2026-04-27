import { sqliteTable, integer, text, index, check } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { timestamp, nullableTimestamp } from "./_helpers";

export const COUPON_TYPES = ["percentage", "fixed"] as const;
export type CouponType = (typeof COUPON_TYPES)[number];

export const coupons = sqliteTable(
  "coupons",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    code: text("code").notNull().unique(),
    type: text("type", { enum: COUPON_TYPES }).notNull(),
    // for percentage: 0-10000 (basis points / 100). for fixed: cents.
    value: integer("value").notNull(),
    minimumOrderCents: integer("minimum_order_cents").notNull().default(0),
    usageLimit: integer("usage_limit"), // null = unlimited
    usedCount: integer("used_count").notNull().default(0),
    status: text("status", { enum: ["active", "inactive"] })
      .notNull()
      .default("active"),
    startsAt: nullableTimestamp("starts_at"),
    expiresAt: nullableTimestamp("expires_at"),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
  (t) => ({
    statusIdx: index("coupons_status_idx").on(t.status),
    valueNonNeg: check("coupons_value_non_neg", sql`${t.value} >= 0`),
  }),
);

export type Coupon = typeof coupons.$inferSelect;
