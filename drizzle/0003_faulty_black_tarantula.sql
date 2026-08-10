CREATE TABLE `manualPremiumEntitlements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`targetUserId` int NOT NULL,
	`grantedByUserId` int NOT NULL,
	`action` enum('grant','revoke') NOT NULL,
	`note` varchar(280),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `manualPremiumEntitlements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `manual_premium_target_created_idx` ON `manualPremiumEntitlements` (`targetUserId`,`createdAt`);