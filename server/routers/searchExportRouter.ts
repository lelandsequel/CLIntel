import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { propertySearches, searchResults } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { generateSearchExcelReport, generateMarketIntelligenceReport } from '../services/searchExportService';

export const searchExportRouter = router({
  /**
   * Export search results to Excel
   */
  exportToExcel: publicProcedure
    .input(z.object({
      searchId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      // Get search details
      const search = await db.select()
        .from(propertySearches)
        .where(eq(propertySearches.id, input.searchId))
        .limit(1);
      
      if (search.length === 0) {
        throw new Error('Search not found');
      }
      
      // Get search results
      const results = await db.select()
        .from(searchResults)
        .where(eq(searchResults.searchId, input.searchId));
      
      // Group by urgency
      const immediate = results.filter(r => r.urgencyLevel === 'immediate');
      const developing = results.filter(r => r.urgencyLevel === 'developing');
      const future = results.filter(r => r.urgencyLevel === 'future');
      
      // Generate Excel report
      const excelBuffer = await generateSearchExcelReport({
        searchName: search[0].name,
        geographicArea: search[0].geographicArea,
        propertyClass: search[0].propertyClass || 'B- to A+',
        minUnits: search[0].minUnits || 100,
        searchDate: search[0].createdAt,
        results: {
          immediate,
          developing,
          future,
        },
      });
      
      // Convert buffer to base64 for transmission
      const base64 = excelBuffer.toString('base64');
      
      return {
        success: true,
        filename: `property-search-${search[0].name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.xlsx`,
        data: base64,
      };
    }),

  /**
   * Export market intelligence summary
   */
  exportMarketIntelligence: publicProcedure
    .input(z.object({
      searchId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      // Get search details
      const search = await db.select()
        .from(propertySearches)
        .where(eq(propertySearches.id, input.searchId))
        .limit(1);
      
      if (search.length === 0) {
        throw new Error('Search not found');
      }
      
      // Get search results
      const results = await db.select()
        .from(searchResults)
        .where(eq(searchResults.searchId, input.searchId));
      
      // Group by urgency
      const immediate = results.filter(r => r.urgencyLevel === 'immediate');
      const developing = results.filter(r => r.urgencyLevel === 'developing');
      const future = results.filter(r => r.urgencyLevel === 'future');
      
      // Generate intelligence report
      const excelBuffer = await generateMarketIntelligenceReport({
        searchName: search[0].name,
        geographicArea: search[0].geographicArea,
        propertyClass: search[0].propertyClass || 'B- to A+',
        minUnits: search[0].minUnits || 100,
        searchDate: search[0].createdAt,
        results: {
          immediate,
          developing,
          future,
        },
      });
      
      // Convert buffer to base64
      const base64 = excelBuffer.toString('base64');
      
      return {
        success: true,
        filename: `market-intelligence-${search[0].name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.xlsx`,
        data: base64,
      };
    }),
});

