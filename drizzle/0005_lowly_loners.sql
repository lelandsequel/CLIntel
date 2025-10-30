CREATE TABLE `propertyDocuments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`originalFileName` varchar(255) NOT NULL,
	`fileSize` int NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`documentType` enum('offering_memo','financial_statement','inspection_report','appraisal','contract','loi','photo','market_analysis','other') NOT NULL,
	`documentCategory` varchar(100),
	`fileKey` varchar(500) NOT NULL,
	`fileUrl` varchar(500) NOT NULL,
	`description` text,
	`uploadedBy` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `propertyDocuments_id` PRIMARY KEY(`id`)
);
