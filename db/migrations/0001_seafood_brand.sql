-- Extend products table with seafood-specific columns
ALTER TABLE `products` ADD COLUMN `seafood_type` text;
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `storage_type` text DEFAULT 'frozen';
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `pack_size` text;
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `unit_type` text DEFAULT 'per pack';
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `origin` text;
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `freshness_note` text;
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `storage_instruction` text;
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `preparation_note` text;
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `delivery_note` text;
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `is_catch_of_week` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `min_order_quantity` integer DEFAULT 1 NOT NULL;
--> statement-breakpoint

-- Weekly promotions
CREATE TABLE `weekly_promos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`image_url` text,
	`badge_text` text,
	`valid_from` integer NOT NULL,
	`valid_until` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `weekly_promos_status_idx` ON `weekly_promos` (`status`);
--> statement-breakpoint
CREATE INDEX `weekly_promos_dates_idx` ON `weekly_promos` (`valid_from`, `valid_until`);
--> statement-breakpoint

CREATE TABLE `weekly_promo_products` (
	`promo_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`promo_id`, `product_id`),
	FOREIGN KEY (`promo_id`) REFERENCES `weekly_promos`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `weekly_promo_products_promo_idx` ON `weekly_promo_products` (`promo_id`);
--> statement-breakpoint

-- Subscription plans
CREATE TABLE `subscription_plans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`image_url` text,
	`frequency` text NOT NULL,
	`price_cents` integer NOT NULL,
	`discount_percent` integer DEFAULT 0 NOT NULL,
	`features` text,
	`status` text DEFAULT 'active' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscription_plans_slug_unique` ON `subscription_plans` (`slug`);
--> statement-breakpoint
CREATE INDEX `subscription_plans_status_idx` ON `subscription_plans` (`status`);
--> statement-breakpoint

CREATE TABLE `customer_subscriptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`plan_id` integer NOT NULL,
	`customer_id` integer,
	`customer_name` text NOT NULL,
	`customer_email` text NOT NULL,
	`customer_phone` text,
	`delivery_address` text,
	`status` text DEFAULT 'active' NOT NULL,
	`next_delivery_at` integer,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `customer_subscriptions_plan_idx` ON `customer_subscriptions` (`plan_id`);
--> statement-breakpoint
CREATE INDEX `customer_subscriptions_email_idx` ON `customer_subscriptions` (`customer_email`);
--> statement-breakpoint
CREATE INDEX `customer_subscriptions_status_idx` ON `customer_subscriptions` (`status`);
--> statement-breakpoint

-- Content pages (CMS)
CREATE TABLE `content_pages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`body` text,
	`meta_description` text,
	`status` text DEFAULT 'published' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `content_pages_slug_unique` ON `content_pages` (`slug`);
--> statement-breakpoint
CREATE INDEX `content_pages_status_idx` ON `content_pages` (`status`);
--> statement-breakpoint

-- Recipes
CREATE TABLE `recipes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`image_url` text,
	`prep_time_minutes` integer,
	`cook_time_minutes` integer,
	`servings` integer,
	`difficulty` text DEFAULT 'easy' NOT NULL,
	`ingredients` text,
	`instructions` text,
	`tips` text,
	`status` text DEFAULT 'published' NOT NULL,
	`featured` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `recipes_slug_unique` ON `recipes` (`slug`);
--> statement-breakpoint
CREATE INDEX `recipes_status_idx` ON `recipes` (`status`);
--> statement-breakpoint
CREATE INDEX `recipes_featured_idx` ON `recipes` (`featured`);
--> statement-breakpoint

CREATE TABLE `recipe_products` (
	`recipe_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`recipe_id`, `product_id`),
	FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `recipe_products_recipe_idx` ON `recipe_products` (`recipe_id`);
--> statement-breakpoint

-- Delivery schedules
CREATE TABLE `delivery_schedules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`day_of_week` integer NOT NULL,
	`label` text NOT NULL,
	`cutoff_time` text NOT NULL,
	`delivery_time` text NOT NULL,
	`areas` text,
	`notes` text,
	`is_active` integer DEFAULT 1 NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `delivery_schedules_day_idx` ON `delivery_schedules` (`day_of_week`);
--> statement-breakpoint

-- Contact messages
CREATE TABLE `contact_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`subject` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `contact_messages_status_idx` ON `contact_messages` (`status`);
--> statement-breakpoint
CREATE INDEX `contact_messages_email_idx` ON `contact_messages` (`email`);
--> statement-breakpoint

-- Newsletter subscribers
CREATE TABLE `newsletter_subscribers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`status` text DEFAULT 'active' NOT NULL,
	`subscribed_at` integer DEFAULT (unixepoch()) NOT NULL,
	`unsubscribed_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `newsletter_subscribers_email_unique` ON `newsletter_subscribers` (`email`);
--> statement-breakpoint
CREATE INDEX `newsletter_subscribers_status_idx` ON `newsletter_subscribers` (`status`);
--> statement-breakpoint

-- Social links
CREATE TABLE `social_links` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`platform` text NOT NULL,
	`url` text NOT NULL,
	`label` text,
	`is_active` integer DEFAULT 1 NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `social_links_platform_unique` ON `social_links` (`platform`);
