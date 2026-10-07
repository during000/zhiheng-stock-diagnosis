CREATE TABLE `screen_saves` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`payload` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_screen_saves_workspace_created` ON `screen_saves` (`workspace_id`,`created_at`);