CREATE TABLE IF NOT EXISTS `hero_slides` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `title` text NOT NULL,
  `subtitle` text,
  `image_url` text,
  `cta_label` text,
  `cta_url` text,
  `slide_type` text DEFAULT 'custom' NOT NULL,
  `status` text DEFAULT 'active' NOT NULL,
  `sort_order` integer DEFAULT 0 NOT NULL,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL,
  `updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `page_heroes` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `page_key` text NOT NULL,
  `title` text NOT NULL,
  `subtitle` text,
  `image_url` text,
  `cta_label` text,
  `cta_url` text,
  `status` text DEFAULT 'active' NOT NULL,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL,
  `updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `page_heroes_page_key_unique` ON `page_heroes` (`page_key`);
