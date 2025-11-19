ALTER TABLE `bookings` ADD `paymentStatus` enum('unpaid','paid','refunded') DEFAULT 'unpaid' NOT NULL;--> statement-breakpoint
ALTER TABLE `bookings` ADD `stripePaymentIntentId` varchar(255);--> statement-breakpoint
ALTER TABLE `bookings` ADD `totalAmount` int;