import {
  sqliteTable,
  integer,
  text,
  index,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { timestamp } from "./_helpers";
import { products } from "./products";
import { customers } from "./customers";

// Weekly promotional items
export const weeklyPromos = sqliteTable(
  "weekly_promos",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    badgeText: text("badge_text"),
    validFrom: integer("valid_from").notNull(),
    validUntil: integer("valid_until").notNull(),
    status: text("status", { enum: ["active", "inactive"] })
      .notNull()
      .default("active"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
  (t) => ({
    statusIdx: index("weekly_promos_status_idx").on(t.status),
    datesIdx: index("weekly_promos_dates_idx").on(t.validFrom, t.validUntil),
  }),
);

export const weeklyPromoProducts = sqliteTable(
  "weekly_promo_products",
  {
    promoId: integer("promo_id")
      .notNull()
      .references(() => weeklyPromos.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.promoId, t.productId] }),
    promoIdx: index("weekly_promo_products_promo_idx").on(t.promoId),
  }),
);

// Subscription plans
export const subscriptionPlans = sqliteTable(
  "subscription_plans",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    imageUrl: text("image_url"),
    frequency: text("frequency", {
      enum: ["weekly", "biweekly", "monthly"],
    }).notNull(),
    priceCents: integer("price_cents").notNull(),
    discountPercent: integer("discount_percent").notNull().default(0),
    features: text("features"), // JSON array of feature strings
    status: text("status", { enum: ["active", "inactive"] })
      .notNull()
      .default("active"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
  (t) => ({
    statusIdx: index("subscription_plans_status_idx").on(t.status),
  }),
);

export const customerSubscriptions = sqliteTable(
  "customer_subscriptions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    planId: integer("plan_id")
      .notNull()
      .references(() => subscriptionPlans.id, { onDelete: "restrict" }),
    customerId: integer("customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    customerPhone: text("customer_phone"),
    deliveryAddress: text("delivery_address"),
    status: text("status", {
      enum: ["active", "paused", "cancelled"],
    })
      .notNull()
      .default("active"),
    nextDeliveryAt: integer("next_delivery_at"),
    notes: text("notes"),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
  (t) => ({
    planIdx: index("customer_subscriptions_plan_idx").on(t.planId),
    emailIdx: index("customer_subscriptions_email_idx").on(t.customerEmail),
    statusIdx: index("customer_subscriptions_status_idx").on(t.status),
  }),
);

// Delivery schedules
export const deliverySchedules = sqliteTable(
  "delivery_schedules",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    dayOfWeek: integer("day_of_week").notNull(), // 0=Sun, 1=Mon, ... 6=Sat
    label: text("label").notNull(),
    cutoffTime: text("cutoff_time").notNull(), // e.g. "12:00"
    deliveryTime: text("delivery_time").notNull(), // e.g. "14:00 - 18:00"
    areas: text("areas"), // JSON array of delivery areas
    notes: text("notes"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
  (t) => ({
    dayIdx: index("delivery_schedules_day_idx").on(t.dayOfWeek),
  }),
);

export type WeeklyPromo = typeof weeklyPromos.$inferSelect;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type CustomerSubscription = typeof customerSubscriptions.$inferSelect;
export type DeliverySchedule = typeof deliverySchedules.$inferSelect;
