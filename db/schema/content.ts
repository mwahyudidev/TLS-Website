import {
  sqliteTable,
  integer,
  text,
  index,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { timestamp } from "./_helpers";
import { products } from "./products";

// CMS content pages
export const contentPages = sqliteTable(
  "content_pages",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    body: text("body"),
    metaDescription: text("meta_description"),
    status: text("status", { enum: ["published", "draft"] })
      .notNull()
      .default("published"),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
  (t) => ({
    statusIdx: index("content_pages_status_idx").on(t.status),
  }),
);

// Recipes
export const recipes = sqliteTable(
  "recipes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    prepTimeMinutes: integer("prep_time_minutes"),
    cookTimeMinutes: integer("cook_time_minutes"),
    servings: integer("servings"),
    difficulty: text("difficulty", { enum: ["easy", "medium", "hard"] })
      .notNull()
      .default("easy"),
    ingredients: text("ingredients"), // JSON array of ingredient strings
    instructions: text("instructions"), // JSON array of step strings
    tips: text("tips"),
    status: text("status", { enum: ["published", "draft"] })
      .notNull()
      .default("published"),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
  (t) => ({
    statusIdx: index("recipes_status_idx").on(t.status),
    featuredIdx: index("recipes_featured_idx").on(t.featured),
  }),
);

export const recipeProducts = sqliteTable(
  "recipe_products",
  {
    recipeId: integer("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.recipeId, t.productId] }),
    recipeIdx: index("recipe_products_recipe_idx").on(t.recipeId),
  }),
);

// Contact messages
export const contactMessages = sqliteTable(
  "contact_messages",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    subject: text("subject").notNull(),
    message: text("message").notNull(),
    status: text("status", { enum: ["new", "read", "replied", "archived"] })
      .notNull()
      .default("new"),
    notes: text("notes"),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
  (t) => ({
    statusIdx: index("contact_messages_status_idx").on(t.status),
    emailIdx: index("contact_messages_email_idx").on(t.email),
  }),
);

// Newsletter subscribers
export const newsletterSubscribers = sqliteTable(
  "newsletter_subscribers",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull().unique(),
    name: text("name"),
    status: text("status", { enum: ["active", "unsubscribed"] })
      .notNull()
      .default("active"),
    subscribedAt: integer("subscribed_at").notNull(),
    unsubscribedAt: integer("unsubscribed_at"),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
  (t) => ({
    statusIdx: index("newsletter_subscribers_status_idx").on(t.status),
  }),
);

// Social links
export const socialLinks = sqliteTable(
  "social_links",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    platform: text("platform", {
      enum: ["instagram", "facebook", "tiktok", "youtube", "whatsapp"],
    })
      .notNull()
      .unique(),
    url: text("url").notNull(),
    label: text("label"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
);

export type ContentPage = typeof contentPages.$inferSelect;
export type Recipe = typeof recipes.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type SocialLink = typeof socialLinks.$inferSelect;
