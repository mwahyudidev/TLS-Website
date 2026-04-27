import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { timestamp } from "./_helpers";
import { users } from "./users";

export const storeSettings = sqliteTable("store_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value").notNull(), // JSON-encoded
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const activityLogs = sqliteTable("activity_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: integer("entity_id"),
  description: text("description"),
  createdAt: timestamp("created_at"),
});

export type StoreSetting = typeof storeSettings.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
