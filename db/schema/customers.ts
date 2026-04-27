import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core";
import { timestamp } from "./_helpers";
import { users } from "./users";

export const customers = sqliteTable(
  "customers",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
  (t) => ({
    emailIdx: index("customers_email_idx").on(t.email),
  }),
);

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
