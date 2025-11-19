CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`parentId` int NOT NULL,
	`nannyId` int NOT NULL,
	`startTime` timestamp NOT NULL,
	`endTime` timestamp NOT NULL,
	`address` text NOT NULL,
	`notes` text,
	`status` enum('pending','accepted','declined','cancelled','completed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nannyProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`bio` text,
	`hourlyRate` int,
	`yearsExperience` int,
	`maxChildren` int,
	`tags` text,
	`isAvailable` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `nannyProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `nannyProfiles_profileId_unique` UNIQUE(`profileId`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`role` enum('parent','nanny') NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`avatarUrl` text,
	`phone` varchar(50),
	`city` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`),
	CONSTRAINT `reviews_bookingId_unique` UNIQUE(`bookingId`)
);
--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_parentId_profiles_id_fk` FOREIGN KEY (`parentId`) REFERENCES `profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_nannyId_profiles_id_fk` FOREIGN KEY (`nannyId`) REFERENCES `profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `nannyProfiles` ADD CONSTRAINT `nannyProfiles_profileId_profiles_id_fk` FOREIGN KEY (`profileId`) REFERENCES `profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_bookingId_bookings_id_fk` FOREIGN KEY (`bookingId`) REFERENCES `bookings`(`id`) ON DELETE cascade ON UPDATE no action;