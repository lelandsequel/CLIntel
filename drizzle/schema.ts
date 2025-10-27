import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Properties table - stores information about properties (both subject and comps)
 */
export const properties = mysqlTable("properties", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  isSubject: boolean("isSubject").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Property = typeof properties.$inferSelect;
export type InsertProperty = typeof properties.$inferInsert;

/**
 * Data imports table - tracks all data import operations
 */
export const dataImports = mysqlTable("dataImports", {
  id: int("id").autoincrement().primaryKey(),
  reportId: int("reportId"), // Link to market report (nullable for backward compatibility)
  importDate: timestamp("importDate").defaultNow().notNull(),
  source: mysqlEnum("source", ["AIQ", "RedIQ"]).notNull(),
  fileName: varchar("fileName", { length: 255 }),
  fileSize: int("fileSize"), // in bytes
  status: mysqlEnum("status", ["pending", "processing", "completed", "error"]).default("pending").notNull(),
  recordsImported: int("recordsImported").default(0),
  recordsFailed: int("recordsFailed").default(0),
  errorMessage: text("errorMessage"),
  createdBy: varchar("createdBy", { length: 255 }),
  processingTimeMs: int("processingTimeMs"), // processing duration in milliseconds
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DataImport = typeof dataImports.$inferSelect;
export type InsertDataImport = typeof dataImports.$inferInsert;

/**
 * Floor plans table - stores floor plan data from both AIQ and RedIQ sources
 */
export const floorPlans = mysqlTable("floorPlans", {
  id: int("id").autoincrement().primaryKey(),
  reportId: int("reportId"), // Link to market report (nullable for backward compatibility)
  propertyId: int("propertyId").notNull().references(() => properties.id, { onDelete: "cascade" }),
  
  // Basic floor plan information
  floorPlanName: varchar("floorPlanName", { length: 255 }),
  bedrooms: decimal("bedrooms", { precision: 3, scale: 1 }),
  bathrooms: decimal("bathrooms", { precision: 3, scale: 1 }),
  squareFeet: int("squareFeet"),
  
  // Rent information
  marketRent: decimal("marketRent", { precision: 10, scale: 2 }),
  effectiveRent: decimal("effectiveRent", { precision: 10, scale: 2 }),
  
  // AIQ specific
  unitsAvailable: int("unitsAvailable"),
  
  // RedIQ specific
  amcRent: decimal("amcRent", { precision: 10, scale: 2 }),
  rediqColumnS: text("rediqColumnS"), // RedIQ Column S (special column)
  numberOfUnits: int("numberOfUnits"), // For summary calculations
  
  // Manual entry columns
  brokerRent: decimal("brokerRent", { precision: 10, scale: 2 }),
  manualAmcRent: decimal("manualAmcRent", { precision: 10, scale: 2 }), // Manual AMC rent entry
  
  // Calculated fields
  rentPsf: decimal("rentPsf", { precision: 10, scale: 4 }), // Rent per square foot
  pricingToolValue: decimal("pricingToolValue", { precision: 10, scale: 2 }),
  
  // Metadata
  dataSource: mysqlEnum("dataSource", ["AIQ", "RedIQ"]).notNull(),
  importId: int("importId").references(() => dataImports.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FloorPlan = typeof floorPlans.$inferSelect;
export type InsertFloorPlan = typeof floorPlans.$inferInsert;

/**
 * Leasing data table - stores RedIQ leasing data (key-value pairs for various metrics)
 */
export const leasingData = mysqlTable("leasingData", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull().references(() => properties.id, { onDelete: "cascade" }),
  metricName: varchar("metricName", { length: 255 }).notNull(),
  metricValue: text("metricValue"),
  metricType: mysqlEnum("metricType", ["number", "percentage", "currency", "text"]),
  displayOrder: int("displayOrder").default(0),
  dataSource: varchar("dataSource", { length: 50 }).default("RedIQ"),
  importId: int("importId").references(() => dataImports.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LeasingData = typeof leasingData.$inferSelect;
export type InsertLeasingData = typeof leasingData.$inferInsert;

/**
 * Reports table - stores generated report configurations
 */
export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  subjectPropertyId: int("subjectPropertyId").references(() => properties.id),
  description: text("description"),
  
  // Report configuration
  includeSummary: boolean("includeSummary").default(true),
  includeLeasingData: boolean("includeLeasingData").default(true),
  selectedColumns: json("selectedColumns"), // Array of column names to include
  filters: json("filters"), // Filter criteria
  sortConfig: json("sortConfig"), // Sort configuration
  
  // Metadata
  createdBy: varchar("createdBy", { length: 255 }),
  lastGeneratedAt: timestamp("lastGeneratedAt"),
  generationCount: int("generationCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

/**
 * Market survey reports - groups AIQ + RedIQ uploads into complete reports
 */
export const marketReports = mysqlTable("marketReports", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  subjectPropertyName: varchar("subjectPropertyName", { length: 255 }),
  description: text("description"),
  status: mysqlEnum("status", ["draft", "complete", "archived"]).default("draft").notNull(),
  
  // Track which imports belong to this report
  aiqImportId: int("aiqImportId").references(() => dataImports.id),
  rediqImportId: int("rediqImportId").references(() => dataImports.id),
  
  // Metadata
  createdBy: varchar("createdBy", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type MarketReport = typeof marketReports.$inferSelect;
export type InsertMarketReport = typeof marketReports.$inferInsert;

/**
 * Property searches - tracks search configurations and executions
 */
export const propertySearches = mysqlTable("propertySearches", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  geographicArea: varchar("geographicArea", { length: 255 }).notNull(), // City, county, metro, state
  propertyClass: varchar("propertyClass", { length: 50 }).default("B- to A+"),
  minUnits: int("minUnits").default(100),
  maxUnits: int("maxUnits"),
  searchDepth: mysqlEnum("searchDepth", ["quick", "deep"]).default("quick").notNull(),
  timeframe: mysqlEnum("timeframe", ["24h", "48h", "7d", "30d"]).default("48h").notNull(),
  status: mysqlEnum("status", ["pending", "running", "completed", "error"]).default("pending").notNull(),
  
  // Results summary
  totalResults: int("totalResults").default(0),
  immediateOpportunities: int("immediateOpportunities").default(0),
  developingOpportunities: int("developingOpportunities").default(0),
  futureOpportunities: int("futureOpportunities").default(0),
  
  // Scheduling
  isRecurring: boolean("isRecurring").default(false),
  recurringSchedule: varchar("recurringSchedule", { length: 100 }), // cron expression
  
  // Metadata
  createdBy: varchar("createdBy", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  errorMessage: text("errorMessage"),
});

export type PropertySearch = typeof propertySearches.$inferSelect;
export type InsertPropertySearch = typeof propertySearches.$inferInsert;

/**
 * Search results - individual properties found during searches
 */
export const searchResults = mysqlTable("searchResults", {
  id: int("id").autoincrement().primaryKey(),
  searchId: int("searchId").notNull().references(() => propertySearches.id, { onDelete: "cascade" }),
  
  // Property information
  propertyName: varchar("propertyName", { length: 255 }).notNull(),
  address: varchar("address", { length: 500 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zipCode", { length: 20 }),
  
  // Property details
  units: int("units"),
  propertyClass: varchar("propertyClass", { length: 50 }),
  yearBuilt: int("yearBuilt"),
  price: int("price"), // in dollars
  pricePerUnit: int("pricePerUnit"),
  
  // Opportunity classification
  opportunityType: mysqlEnum("opportunityType", [
    "new_listing",
    "distressed_sale",
    "new_construction",
    "underperforming",
    "company_distress",
    "off_market"
  ]).notNull(),
  urgencyLevel: mysqlEnum("urgencyLevel", ["immediate", "developing", "future"]).notNull(),
  
  // Metrics
  occupancyRate: decimal("occupancyRate", { precision: 5, scale: 2 }),
  capRate: decimal("capRate", { precision: 5, scale: 2 }),
  daysOnMarket: int("daysOnMarket"),
  
  // Scoring
  score: int("score").default(0), // 0-100 score based on multiple factors
  
  // Source information
  dataSource: varchar("dataSource", { length: 100 }), // LoopNet, CoStar, etc.
  sourceUrl: varchar("sourceUrl", { length: 500 }),
  rawData: text("rawData"), // JSON string of original data
  
  // Tracking
  status: mysqlEnum("status", ["new", "reviewing", "contacted", "pursuing", "passed", "closed"]).default("new"),
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SearchResult = typeof searchResults.$inferSelect;
export type InsertSearchResult = typeof searchResults.$inferInsert;

/**
 * Market metrics - tracking key market indicators over time
 */
export const marketMetrics = mysqlTable("marketMetrics", {
  id: int("id").autoincrement().primaryKey(),
  marketName: varchar("marketName", { length: 255 }).notNull(), // City or metro area
  date: timestamp("date").notNull(),
  
  // Key metrics
  avgPricePerUnit: int("avgPricePerUnit"),
  avgCapRate: decimal("avgCapRate", { precision: 5, scale: 2 }),
  vacancyRate: decimal("vacancyRate", { precision: 5, scale: 2 }),
  absorptionRate: decimal("absorptionRate", { precision: 5, scale: 2 }),
  avgDaysOnMarket: int("avgDaysOnMarket"),
  
  dataSource: varchar("dataSource", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MarketMetric = typeof marketMetrics.$inferSelect;
export type InsertMarketMetric = typeof marketMetrics.$inferInsert;

