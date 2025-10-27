import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { properties, floorPlans, dataImports } from '../../drizzle/schema';
import { parseAIQFile, parseRedIQFile, validateAIQFile, validateRedIQFile } from '../utils/excelParser';
import { eq, and, desc } from 'drizzle-orm';

export const dataRouter = router({
  /**
   * Upload and process AIQ file
   */
  uploadAIQ: publicProcedure
    .input(z.object({
      fileName: z.string(),
      fileData: z.string(), // Base64 encoded file data
      subjectPropertyName: z.string().optional(),
      reportId: z.number().optional(), // Link to specific report
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const startTime = Date.now();
      
      try {
        // Decode base64 file data
        const buffer = Buffer.from(input.fileData, 'base64');
        
        // Validate file
        const validation = validateAIQFile(buffer);
        if (!validation.valid) {
          throw new Error(validation.error || 'Invalid AIQ file');
        }
        
        // Create import record
        const [importRecord] = await db.insert(dataImports).values({
          reportId: input.reportId,
          source: 'AIQ',
          fileName: input.fileName,
          fileSize: buffer.length,
          status: 'processing',
        });
        
        const importId = importRecord.insertId;
        
        try {
          // Parse file
          const parsedData = parseAIQFile(buffer);
          
          let recordsImported = 0;
          let recordsFailed = 0;
          
          // Process each row
          for (const row of parsedData) {
            try {
              // Find or create property
              const existingProperties = await db.select().from(properties).where(eq(properties.name, row.property)).limit(1);
              let propertyRecord = existingProperties.length > 0 ? existingProperties[0] : null;
              
              if (!propertyRecord) {
                const [newProperty] = await db.insert(properties).values({
                  name: row.property,
                  isSubject: row.property === input.subjectPropertyName,
                });
                propertyRecord = {
                  id: newProperty.insertId,
                  name: row.property,
                  isSubject: row.property === input.subjectPropertyName || false,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                };
              }
              
              // Calculate rent PSF
              const rentPsf = row.availableAskingRent && row.sqFt && row.sqFt > 0
                ? row.availableAskingRent / row.sqFt
                : null;
              
              // Insert floor plan data
              await db.insert(floorPlans).values({
                reportId: input.reportId,
                propertyId: propertyRecord.id,
                floorPlanName: row.floorPlan,
                bedrooms: row.bedCount?.toString() || null,
                bathrooms: row.bathCount?.toString() || null,
                squareFeet: row.sqFt,
                marketRent: row.availableAskingRent?.toString() || null,
                unitsAvailable: row.availableUnits,
                numberOfUnits: row.totalUnits,
                rentPsf: rentPsf?.toString() || null,
                dataSource: 'AIQ',
                importId,
              });
              
              recordsImported++;
            } catch (error) {
              console.error('Failed to import row:', error);
              recordsFailed++;
            }
          }
          
          // Update import record
          const processingTime = Date.now() - startTime;
          await db.update(dataImports)
            .set({
              status: 'completed',
              recordsImported,
              recordsFailed,
              processingTimeMs: processingTime,
            })
            .where(eq(dataImports.id, importId));
          
          return {
            success: true,
            importId,
            recordsImported,
            recordsFailed,
            processingTimeMs: processingTime,
          };
        } catch (error) {
          // Update import record with error
          await db.update(dataImports)
            .set({
              status: 'error',
              errorMessage: error instanceof Error ? error.message : 'Unknown error',
            })
            .where(eq(dataImports.id, importId));
          
          throw error;
        }
      } catch (error) {
        throw new Error(`Failed to process AIQ file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  /**
   * Upload and process RedIQ file
   */
  uploadRedIQ: publicProcedure
    .input(z.object({
      fileName: z.string(),
      fileData: z.string(), // Base64 encoded file data
      subjectPropertyName: z.string(),
      reportId: z.number().optional(), // Link to specific report
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const startTime = Date.now();
      
      try {
        // Decode base64 file data
        const buffer = Buffer.from(input.fileData, 'base64');
        
        // Validate file
        const validation = validateRedIQFile(buffer);
        if (!validation.valid) {
          throw new Error(validation.error || 'Invalid RedIQ file');
        }
        
        // Create import record
        const [importRecord] = await db.insert(dataImports).values({
          reportId: input.reportId,
          source: 'RedIQ',
          fileName: input.fileName,
          fileSize: buffer.length,
          status: 'processing',
        });
        
        const importId = importRecord.insertId;
        
        try {
          // Parse file
          const parsedData = parseRedIQFile(buffer);
          
          let recordsImported = 0;
          let recordsFailed = 0;
          
          // Find or create subject property
          const existingSubject = await db.select().from(properties)
            .where(and(
              eq(properties.name, input.subjectPropertyName),
              eq(properties.isSubject, true)
            ))
            .limit(1);
          
          let subjectProperty = existingSubject.length > 0 ? existingSubject[0] : null;
          
          if (!subjectProperty) {
            const [newProperty] = await db.insert(properties).values({
              name: input.subjectPropertyName,
              isSubject: true,
            });
            subjectProperty = {
              id: newProperty.insertId,
              name: input.subjectPropertyName,
              isSubject: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
          }
          
          // Process each row
          for (const row of parsedData) {
            try {
              // Calculate rent PSF
              const rentPsf = row.marketRent && row.netSf && row.netSf > 0
                ? row.marketRent / row.netSf
                : null;
              
              // Insert floor plan data
              await db.insert(floorPlans).values({
                reportId: input.reportId,
                propertyId: subjectProperty.id,
                floorPlanName: row.floorPlan,
                bedrooms: row.bed?.toString() || null,
                bathrooms: row.bath?.toString() || null,
                squareFeet: row.netSf,
                marketRent: row.marketRent?.toString() || null,
                amcRent: row.inPlaceRent?.toString() || null,
                numberOfUnits: row.units,
                rediqColumnS: row.columnS,
                rentPsf: rentPsf?.toString() || null,
                dataSource: 'RedIQ',
                importId,
              });
              
              recordsImported++;
            } catch (error) {
              console.error('Failed to import row:', error);
              recordsFailed++;
            }
          }
          
          // Update import record
          const processingTime = Date.now() - startTime;
          await db.update(dataImports)
            .set({
              status: 'completed',
              recordsImported,
              recordsFailed,
              processingTimeMs: processingTime,
            })
            .where(eq(dataImports.id, importId));
          
          return {
            success: true,
            importId,
            recordsImported,
            recordsFailed,
            processingTimeMs: processingTime,
          };
        } catch (error) {
          // Update import record with error
          await db.update(dataImports)
            .set({
              status: 'error',
              errorMessage: error instanceof Error ? error.message : 'Unknown error',
            })
            .where(eq(dataImports.id, importId));
          
          throw error;
        }
      } catch (error) {
        throw new Error(`Failed to process RedIQ file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  /**
   * Get all properties
   */
  getProperties: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return [];
      
      return await db.select().from(properties).orderBy(desc(properties.isSubject), properties.name);
    }),

  /**
   * Get import history
   */
  getImportHistory: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return [];
      
      return await db.select().from(dataImports).orderBy(desc(dataImports.importDate)).limit(50);
    }),

  /**
   * Get consolidated floor plan data
   */
  getConsolidatedData: publicProcedure
    .input(z.object({
      reportId: z.number().optional(),
      subjectPropertyId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      // Build where clause
      let whereClause = input.reportId ? eq(floorPlans.reportId, input.reportId) : undefined;
      
      // Get floor plans with their properties
      const query = db.select({
        floorPlan: floorPlans,
        property: properties,
      })
      .from(floorPlans)
      .leftJoin(properties, eq(floorPlans.propertyId, properties.id))
      .orderBy(desc(properties.isSubject), properties.name);
      
      const allFloorPlans = whereClause ? await query.where(whereClause) : await query;
      
      return allFloorPlans;
    }),
});

