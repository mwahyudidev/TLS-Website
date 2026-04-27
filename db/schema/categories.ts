import { sqliteTable, integer, text, index, primaryKey } from "drizzle-orm/sqlite-core";
import { timestamp } from "./_helpers";

export const categories = sqliteTable(
  "categories",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    imageUrl: text("image_url"),
    status: text("status", { enum: ["active", "inactive"] })
      .notNull()
      .default("active"),
    navGroup: text("nav_group"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
  (t) => ({
    statusIdx: index("categories_status_idx").on(t.status),
  }),
);

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
