CREATE TABLE `marketReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`subjectPropertyName` varchar(255),
	`description` text,
	`status` enum('draft','complete','archived') NOT NULL DEFAULT 'draft',
	`aiqImportId` int,
	`rediqImportId` int,
	`createdBy` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	CONSTRAINT `marketReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `dataImports` ADD `reportId` int;--> statement-breakpoint
ALTER TABLE `floorPlans` ADD `reportId` int;--> statement-breakpoint
ALTER TABLE `marketReports` ADD CONSTRAINT `marketReports_aiqImportId_dataImports_id_fk` FOREIGN KEY (`aiqImportId`) REFERENCES `dataImports`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `marketReports` ADD CONSTRAINT `marketReports_rediqImportId_dataImports_id_fk` FOREIGN KEY (`rediqImportId`) REFERENCES `dataImports`(`id`) ON DELETE no action ON UPDATE no action;