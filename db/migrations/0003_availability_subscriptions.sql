CREATE TABLE IF NOT EXISTS `availability_subscriptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer_name` text NOT NULL,
	`customer_email` text NOT NULL,
	`customer_phone` text,
	`product_id` integer,
	`category_id` integer,
	`subscription_type` text NOT NULL DEFAULT 'back_in_stock',
	`status` text NOT NULL DEFAULT 'pending',
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
