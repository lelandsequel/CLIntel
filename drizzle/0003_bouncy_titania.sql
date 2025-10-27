CREATE TABLE `marketMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`marketName` varchar(255) NOT NULL,
	`date` timestamp NOT NULL,
	`avgPricePerUnit` int,
	`avgCapRate` decimal(5,2),
	`vacancyRate` decimal(5,2),
	`absorptionRate` decimal(5,2),
	`avgDaysOnMarket` int,
	`dataSource` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `marketMetrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `propertySearches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`geographicArea` varchar(255) NOT NULL,
	`propertyClass` varchar(50) DEFAULT 'B- to A+',
	`minUnits` int DEFAULT 100,
	`maxUnits` int,
	`searchDepth` enum('quick','deep') NOT NULL DEFAULT 'quick',
	`timeframe` enum('24h','48h','7d','30d') NOT NULL DEFAULT '48h',
	`status` enum('pending','running','completed','error') NOT NULL DEFAULT 'pending',
	`totalResults` int DEFAULT 0,
	`immediateOpportunities` int DEFAULT 0,
	`developingOpportunities` int DEFAULT 0,
	`futureOpportunities` int DEFAULT 0,
	`isRecurring` boolean DEFAULT false,
	`recurringSchedule` varchar(100),
	`createdBy` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`startedAt` timestamp,
	`completedAt` timestamp,
	`errorMessage` text,
	CONSTRAINT `propertySearches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `searchResults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`searchId` int NOT NULL,
	`propertyName` varchar(255) NOT NULL,
	`address` varchar(500),
	`city` varchar(100),
	`state` varchar(50),
	`zipCode` varchar(20),
	`units` int,
	`propertyClass` varchar(50),
	`yearBuilt` int,
	`price` int,
	`pricePerUnit` int,
	`opportunityType` enum('new_listing','distressed_sale','new_construction','underperforming','company_distress','off_market') NOT NULL,
	`urgencyLevel` enum('immediate','developing','future') NOT NULL,
	`occupancyRate` decimal(5,2),
	`capRate` decimal(5,2),
	`daysOnMarket` int,
	`score` int DEFAULT 0,
	`dataSource` varchar(100),
	`sourceUrl` varchar(500),
	`rawData` text,
	`status` enum('new','reviewing','contacted','pursuing','passed','closed') DEFAULT 'new',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `searchResults_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `searchResults` ADD CONSTRAINT `searchResults_searchId_propertySearches_id_fk` FOREIGN KEY (`searchId`) REFERENCES `propertySearches`(`id`) ON DELETE cascade ON UPDATE no action;