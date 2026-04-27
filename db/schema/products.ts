import {
  sqliteTable,
  integer,
  text,
  index,
  primaryKey,
  check,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { timestamp } from "./_helpers";
import { categories } from "./categories";

export const products = sqliteTable(
  "products",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    priceCents: integer("price_cents").notNull(),
    compareAtPriceCents: integer("compare_at_price_cents"),
    stock: integer("stock").notNull().default(0),
    sku: text("sku").notNull().unique(),
    weightGrams: integer("weight_grams").notNull().default(0),
    status: text("status", { enum: ["draft", "active", "archived"] })
      .notNull()
      .default("draft"),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    // Seafood-specific fields
    seafoodType: text("seafood_type"),
    storageType: text("storage_type", { enum: ["live", "chilled", "frozen"] }),
    packSize: text("pack_size"),
    unitType: text("unit_type"),
    origin: text("origin"),
    freshnessNote: text("freshness_note"),
    storageInstruction: text("storage_instruction"),
    preparationNote: text("preparation_note"),
    deliveryNote: text("delivery_note"),
    isCatchOfWeek: integer("is_catch_of_week", { mode: "boolean" }).notNull().default(false),
    minOrderQuantity: integer("min_order_quantity").notNull().default(1),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
  (t) => ({
    statusIdx: index("products_status_idx").on(t.status),
    featuredIdx: index("products_featured_idx").on(t.featured),
    nameIdx: index("products_name_idx").on(t.name),
    stockNonNeg: check("products_stock_non_neg", sql`${t.stock} >= 0`),
    priceNonNeg: check("products_price_non_neg", sql`${t.priceCents} >= 0`),
  }),
);

export const productImages = sqliteTable(
  "product_images",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    altText: text("alt_text"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
  (t) => ({
    productIdx: index("product_images_product_idx").on(t.productId),
  }),
);

export const productCategories = sqliteTable(
  "product_categories",
  {
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.productId, t.categoryId] }),
    catIdx: index("product_categories_cat_idx").on(t.categoryId),
  }),
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductImage = typeof productImages.$inferSelect;
