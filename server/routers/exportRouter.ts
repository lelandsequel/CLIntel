import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { properties, floorPlans } from '../../drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { generateExcelReport, generateCSVReport, ConsolidatedRow } from '../utils/excelExport';

export const exportRouter = router({
  /**
   * Export consolidated data to Excel
   */
  exportExcel: publicProcedure
    .input(z.object({
      subjectPropertyId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      // Get all floor plans with their properties
      const allFloorPlans = await db.select({
        floorPlan: floorPlans,
        property: properties,
      })
      .from(floorPlans)
      .leftJoin(properties, eq(floorPlans.propertyId, properties.id))
      .orderBy(desc(properties.isSubject), properties.name);
      
      // Transform to consolidated rows
      const rows: ConsolidatedRow[] = allFloorPlans.map(item => ({
        property: item.property?.name || 'Unknown',
        isSubject: item.property?.isSubject || false,
        floorPlan: item.floorPlan.floorPlanName || '',
        bedrooms: item.floorPlan.bedrooms,
        bathrooms: item.floorPlan.bathrooms,
        squareFeet: item.floorPlan.squareFeet,
        numberOfUnits: item.floorPlan.numberOfUnits,
        marketRent: item.floorPlan.marketRent,
        rentPsf: item.floorPlan.rentPsf,
        amcRent: item.floorPlan.amcRent,
        brokerRent: item.floorPlan.brokerRent,
        rediqColumnS: item.floorPlan.rediqColumnS,
        dataSource: item.floorPlan.dataSource,
      }));
      
      // Find subject property name
      const subjectProperty = allFloorPlans.find(item => item.property?.isSubject);
      const subjectPropertyName = subjectProperty?.property?.name;
      
      // Generate Excel file
      const buffer = generateExcelReport(rows, subjectPropertyName);
      
      // Convert to base64 for transmission
      const base64 = buffer.toString('base64');
      
      return {
        success: true,
        fileName: `Market_Survey_${new Date().toISOString().split('T')[0]}.xlsx`,
        fileData: base64,
        recordCount: rows.length,
      };
    }),

  /**
   * Export consolidated data to CSV
   */
  exportCSV: publicProcedure
    .input(z.object({
      subjectPropertyId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      // Get all floor plans with their properties
      const allFloorPlans = await db.select({
        floorPlan: floorPlans,
        property: properties,
      })
      .from(floorPlans)
      .leftJoin(properties, eq(floorPlans.propertyId, properties.id))
      .orderBy(desc(properties.isSubject), properties.name);
      
      // Transform to consolidated rows
      const rows: ConsolidatedRow[] = allFloorPlans.map(item => ({
        property: item.property?.name || 'Unknown',
        isSubject: item.property?.isSubject || false,
        floorPlan: item.floorPlan.floorPlanName || '',
        bedrooms: item.floorPlan.bedrooms,
        bathrooms: item.floorPlan.bathrooms,
        squareFeet: item.floorPlan.squareFeet,
        numberOfUnits: item.floorPlan.numberOfUnits,
        marketRent: item.floorPlan.marketRent,
        rentPsf: item.floorPlan.rentPsf,
        amcRent: item.floorPlan.amcRent,
        brokerRent: item.floorPlan.brokerRent,
        rediqColumnS: item.floorPlan.rediqColumnS,
        dataSource: item.floorPlan.dataSource,
      }));
      
      // Generate CSV
      const csvContent = generateCSVReport(rows);
      
      return {
        success: true,
        fileName: `Market_Survey_${new Date().toISOString().split('T')[0]}.csv`,
        fileData: csvContent,
        recordCount: rows.length,
      };
    }),
});

