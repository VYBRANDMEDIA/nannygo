ALTER TABLE `profiles` MODIFY COLUMN `role` enum('parent','nanny','admin') NOT NULL;--> statement-breakpoint
ALTER TABLE `nannyProfiles` ADD `stripeCustomerId` varchar(255);--> statement-breakpoint
ALTER TABLE `nannyProfiles` ADD `stripeSubscriptionId` varchar(255);--> statement-breakpoint
ALTER TABLE `nannyProfiles` ADD `subscriptionStatus` enum('active','trialing','past_due','canceled','incomplete');--> statement-breakpoint
ALTER TABLE `nannyProfiles` ADD `trialEndsAt` timestamp;--> statement-breakpoint
ALTER TABLE `profiles` ADD `isActive` int DEFAULT 1 NOT NULL;