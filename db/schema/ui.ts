import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const heroSlides = sqliteTable("hero_slides", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  imageUrl: text("image_url"),
  ctaLabel: text("cta_label"),
  ctaUrl: text("cta_url"),
  slideType: text("slide_type", {
    enum: ["welcome", "promo", "subscription", "category", "whatsapp", "custom"],
  })
    .notNull()
    .default("custom"),
  status: text("status", { enum: ["active", "inactive"] })
    .notNull()
    .default("active"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

export const pageHeroes = sqliteTable("page_heroes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pageKey: text("page_key").notNull().unique(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  imageUrl: text("image_url"),
  ctaLabel: text("cta_label"),
  ctaUrl: text("cta_url"),
  status: text("status", { enum: ["active", "inactive"] })
    .notNull()
    .default("active"),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at")
    .notNull()
    .default(sql`(unixepoch())`),
});
