CREATE TABLE `campaignImages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`userId` int NOT NULL,
	`prompt` text NOT NULL,
	`imageUrl` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `campaignImages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaignOutputs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`platform` enum('appStore','googlePlay','twitter','instagram','linkedin','productHunt') NOT NULL,
	`content` text NOT NULL,
	`characterCount` int NOT NULL,
	`characterLimit` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaignOutputs_id` PRIMARY KEY(`id`),
	CONSTRAINT `campaign_outputs_campaign_platform_unique` UNIQUE(`campaignId`,`platform`)
);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(150) NOT NULL,
	`sourceKind` enum('url','brief','manual') NOT NULL,
	`sourceUrl` text,
	`sourceText` text NOT NULL,
	`contextJson` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `imageUsagePeriods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`periodKey` varchar(7) NOT NULL,
	`imageGenerationCount` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `imageUsagePeriods_id` PRIMARY KEY(`id`),
	CONSTRAINT `image_usage_user_period_unique` UNIQUE(`userId`,`periodKey`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `plan` enum('free','premium') DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `stripeSubscriptionId` varchar(128);--> statement-breakpoint
CREATE INDEX `campaign_images_campaign_idx` ON `campaignImages` (`campaignId`);--> statement-breakpoint
CREATE INDEX `campaigns_user_updated_idx` ON `campaigns` (`userId`,`updatedAt`);