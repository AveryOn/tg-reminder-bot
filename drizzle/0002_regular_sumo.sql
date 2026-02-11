PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`raw_text` text NOT NULL,
	`raw_delivery_at` text,
	`parsed_json` text,
	`timezone` text NOT NULL,
	`type` text DEFAULT 'reminder' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`next_run_at` text,
	`last_run_at` text,
	`tg_user_id` integer NOT NULL,
	FOREIGN KEY (`tg_user_id`) REFERENCES `tg_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_tasks`("id", "created_at", "updated_at", "raw_text", "raw_delivery_at", "parsed_json", "timezone", "type", "status", "next_run_at", "last_run_at", "tg_user_id") SELECT "id", "created_at", "updated_at", "raw_text", "raw_delivery_at", "parsed_json", "timezone", "type", "status", "next_run_at", "last_run_at", "tg_user_id" FROM `tasks`;--> statement-breakpoint
DROP TABLE `tasks`;--> statement-breakpoint
ALTER TABLE `__new_tasks` RENAME TO `tasks`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_tg_users` (
	`id` integer PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_tg_users`("id", "created_at", "updated_at") SELECT "id", "created_at", "updated_at" FROM `tg_users`;--> statement-breakpoint
DROP TABLE `tg_users`;--> statement-breakpoint
ALTER TABLE `__new_tg_users` RENAME TO `tg_users`;