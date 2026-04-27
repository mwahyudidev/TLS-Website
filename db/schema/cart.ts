import {
  sqliteTable,
  integer,
  text,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { timestamp } from "./_helpers";
import { users } from "./users";
import { products } from "./products";

export const carts = sqliteTable(
  "carts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    sessionId: text("session_id"),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
  (t) => ({
    userIdx: index("carts_user_idx").on(t.userId),
    sessionIdx: index("carts_session_idx").on(t.sessionId),
    userOrSession: check(
      "carts_user_or_session",
      sql`${t.userId} IS NOT NULL OR ${t.sessionId} IS NOT NULL`,
    ),
  }),
);

export const cartItems = sqliteTable(
  "cart_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    cartId: integer("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull(),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
  (t) => ({
    cartProductUq: uniqueIndex("cart_items_cart_product_uq").on(
      t.cartId,
      t.productId,
    ),
    qtyPos: check("cart_items_qty_positive", sql`${t.quantity} > 0`),
  }),
);

export type Cart = typeof carts.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
