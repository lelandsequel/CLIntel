CREATE TABLE `dataImports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`importDate` timestamp NOT NULL DEFAULT (now()),
	`source` enum('AIQ','RedIQ') NOT NULL,
	`fileName` varchar(255),
	`fileSize` int,
	`status` enum('pending','processing','completed','error') NOT NULL DEFAULT 'pending',
	`recordsImported` int DEFAULT 0,
	`recordsFailed` int DEFAULT 0,
	`errorMessage` text,
	`createdBy` varchar(255),
	`processingTimeMs` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dataImports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `floorPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`floorPlanName` varchar(255),
	`bedrooms` decimal(3,1),
	`bathrooms` decimal(3,1),
	`squareFeet` int,
	`marketRent` decimal(10,2),
	`effectiveRent` decimal(10,2),
	`unitsAvailable` int,
	`amcRent` decimal(10,2),
	`rediqColumnS` text,
	`numberOfUnits` int,
	`brokerRent` decimal(10,2),
	`manualAmcRent` decimal(10,2),
	`rentPsf` decimal(10,4),
	`pricingToolValue` decimal(10,2),
	`dataSource` enum('AIQ','RedIQ') NOT NULL,
	`importId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `floorPlans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leasingData` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`metricName` varchar(255) NOT NULL,
	`metricValue` text,
	`metricType` enum('number','percentage','currency','text'),
	`displayOrder` int DEFAULT 0,
	`dataSource` varchar(50) DEFAULT 'RedIQ',
	`importId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leasingData_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `properties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`isSubject` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `properties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`subjectPropertyId` int,
	`description` text,
	`includeSummary` boolean DEFAULT true,
	`includeLeasingData` boolean DEFAULT true,
	`selectedColumns` json,
	`filters` json,
	`sortConfig` json,
	`createdBy` varchar(255),
	`lastGeneratedAt` timestamp,
	`generationCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `floorPlans` ADD CONSTRAINT `floorPlans_propertyId_properties_id_fk` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `floorPlans` ADD CONSTRAINT `floorPlans_importId_dataImports_id_fk` FOREIGN KEY (`importId`) REFERENCES `dataImports`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leasingData` ADD CONSTRAINT `leasingData_propertyId_properties_id_fk` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leasingData` ADD CONSTRAINT `leasingData_importId_dataImports_id_fk` FOREIGN KEY (`importId`) REFERENCES `dataImports`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reports` ADD CONSTRAINT `reports_subjectPropertyId_properties_id_fk` FOREIGN KEY (`subjectPropertyId`) REFERENCES `properties`(`id`) ON DELETE no action ON UPDATE no action;