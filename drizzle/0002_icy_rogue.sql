CREATE TABLE `guestImageAllowances` (
	`guestId` varchar(64) NOT NULL,
	`imageGenerationCount` int NOT NULL DEFAULT 0,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `guestImageAllowances_guestId` PRIMARY KEY(`guestId`)
);
--> statement-breakpoint
CREATE INDEX `guest_image_allowance_expiry_idx` ON `guestImageAllowances` (`expiresAt`);