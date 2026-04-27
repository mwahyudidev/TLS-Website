import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const availabilitySubscriptions = sqliteTable("availability_subscriptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  productId: integer("product_id"),
  categoryId: integer("category_id"),
  subscriptionType: text("subscription_type", {
    enum: ["back_in_stock", "new_arrival", "category_alert", "general_update"],
  })
    .notNull()
    .default("back_in_stock"),
  status: text("status", {
    enum: ["pending", "notified", "cancelled"],
  })
    .notNull()
    .default("pending"),
  notes: text("notes"),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

export type AvailabilitySubscription = typeof availabilitySubscriptions.$inferSelect;
export type NewAvailabilitySubscription = typeof availabilitySubscriptions.$inferInsert;
