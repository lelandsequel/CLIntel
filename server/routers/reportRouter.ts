import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { marketReports, dataImports, floorPlans, properties } from '../../drizzle/schema';
import { eq, desc, and } from 'drizzle-orm';

export const reportRouter = router({
  /**
   * Create a new market report
   */
  create: publicProcedure
    .input(z.object({
      name: z.string(),
      subjectPropertyName: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const [result] = await db.insert(marketReports).values({
        name: input.name,
        subjectPropertyName: input.subjectPropertyName,
        description: input.description,
        status: 'draft',
      });
      
      return {
        success: true,
        reportId: result.insertId,
      };
    }),

  /**
   * Get all market reports
   */
  list: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return [];
      
      const allReports = await db.select().from(marketReports).orderBy(desc(marketReports.createdAt));
      
      // Get import counts for each report
      const reportsWithCounts = await Promise.all(
        allReports.map(async (report) => {
          const imports = await db.select()
            .from(dataImports)
            .where(eq(dataImports.reportId, report.id));
          
          const aiqImport = imports.find(imp => imp.source === 'AIQ');
          const rediqImport = imports.find(imp => imp.source === 'RedIQ');
          
          const floorPlanCount = await db.select()
            .from(floorPlans)
            .where(eq(floorPlans.reportId, report.id));
          
          return {
            ...report,
            hasAIQ: !!aiqImport,
            hasRedIQ: !!rediqImport,
            floorPlanCount: floorPlanCount.length,
            isComplete: !!aiqImport && !!rediqImport,
          };
        })
      );
      
      return reportsWithCounts;
    }),

  /**
   * Get a specific report with details
   */
  get: publicProcedure
    .input(z.object({
      reportId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const report = await db.select()
        .from(marketReports)
        .where(eq(marketReports.id, input.reportId))
        .limit(1);
      
      if (report.length === 0) {
        throw new Error('Report not found');
      }
      
      // Get associated imports
      const imports = await db.select()
        .from(dataImports)
        .where(eq(dataImports.reportId, input.reportId));
      
      // Get floor plans for this report
      const floorPlanData = await db.select({
        floorPlan: floorPlans,
        property: properties,
      })
      .from(floorPlans)
      .leftJoin(properties, eq(floorPlans.propertyId, properties.id))
      .where(eq(floorPlans.reportId, input.reportId))
      .orderBy(desc(properties.isSubject), properties.name);
      
      return {
        report: report[0],
        imports,
        floorPlans: floorPlanData,
      };
    }),

  /**
   * Update report status
   */
  updateStatus: publicProcedure
    .input(z.object({
      reportId: z.number(),
      status: z.enum(['draft', 'complete', 'archived']),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const updates: any = {
        status: input.status,
      };
      
      if (input.status === 'complete') {
        updates.completedAt = new Date();
      }
      
      await db.update(marketReports)
        .set(updates)
        .where(eq(marketReports.id, input.reportId));
      
      return { success: true };
    }),

  /**
   * Delete a report and all associated data
   */
  delete: publicProcedure
    .input(z.object({
      reportId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      // Delete floor plans
      await db.delete(floorPlans).where(eq(floorPlans.reportId, input.reportId));
      
      // Delete imports
      await db.delete(dataImports).where(eq(dataImports.reportId, input.reportId));
      
      // Delete report
      await db.delete(marketReports).where(eq(marketReports.id, input.reportId));
      
      return { success: true };
    }),

  /**
   * Update report metadata
   */
  update: publicProcedure
    .input(z.object({
      reportId: z.number(),
      name: z.string().optional(),
      subjectPropertyName: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const updates: any = {};
      if (input.name) updates.name = input.name;
      if (input.subjectPropertyName !== undefined) updates.subjectPropertyName = input.subjectPropertyName;
      if (input.description !== undefined) updates.description = input.description;
      
      await db.update(marketReports)
        .set(updates)
        .where(eq(marketReports.id, input.reportId));
      
      return { success: true };
    }),
});

