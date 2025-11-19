ALTER TABLE `reviews` DROP INDEX `reviews_bookingId_unique`;--> statement-breakpoint
ALTER TABLE `profiles` ADD `photoGallery` text;--> statement-breakpoint
ALTER TABLE `profiles` ADD `youtubeVideoUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `profiles` ADD `averageRating` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `profiles` ADD `reviewCount` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `reviews` ADD `reviewerId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `reviews` ADD `revieweeId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_reviewerId_profiles_id_fk` FOREIGN KEY (`reviewerId`) REFERENCES `profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_revieweeId_profiles_id_fk` FOREIGN KEY (`revieweeId`) REFERENCES `profiles`(`id`) ON DELETE cascade ON UPDATE no action;