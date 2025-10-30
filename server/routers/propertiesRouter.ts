import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { searchResults, propertySearches } from '../../drizzle/schema';
import { desc, sql, eq } from 'drizzle-orm';

// Helper function to get or create the manual entries search record
async function getManualEntriesSearchId(db: any): Promise<number> {
  const existing = await db.select().from(propertySearches).where(eq(propertySearches.name, 'Manual Entries')).limit(1);
  
  if (existing.length > 0) {
    return existing[0].id;
  }
  
  // Create it if it doesn't exist
  const [result] = await db.insert(propertySearches).values({
    name: 'Manual Entries',
    geographicArea: 'Various',
    status: 'completed',
    totalResults: 0,
  });
  
  return result.insertId;
}

export const propertiesRouter = router({
  /**
   * Create a single property manually
   */
  create: publicProcedure
    .input(z.object({
      propertyName: z.string(),
      address: z.string().optional(),
      city: z.string(),
      state: z.string(),
      zipCode: z.string().optional(),
      units: z.number().optional(),
      propertyClass: z.string().optional(),
      yearBuilt: z.number().optional(),
      price: z.number().optional(),
      opportunityType: z.enum(['new_listing', 'distressed_sale', 'new_construction', 'underperforming', 'company_distress', 'off_market']),
      propertyType: z.enum(['acquisition', 'management_target']).default('acquisition'),
      urgencyLevel: z.enum(['immediate', 'developing', 'future']),
      dataSource: z.string().optional(),
      sourceUrl: z.string().optional(),
      notes: z.string().optional(),
      // Multifamily acquisition fields
      debtAmount: z.string().optional(),
      currentOwner: z.string().optional(),
      lender: z.string().optional(),
      acquisitionDateByOwner: z.string().optional(),
      foreclosureStatus: z.string().optional(),
      buyRationale: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const searchId = await getManualEntriesSearchId(db);
      const pricePerUnit = input.price && input.units ? Math.round(input.price / input.units) : undefined;
      const score = input.urgencyLevel === 'immediate' ? 80 : input.urgencyLevel === 'developing' ? 60 : 40;
      
      const [result] = await db.insert(searchResults).values({
        searchId, // Manual entry search
        propertyName: input.propertyName,
        address: input.address,
        city: input.city,
        state: input.state,
        zipCode: input.zipCode,
        units: input.units,
        propertyClass: input.propertyClass,
        yearBuilt: input.yearBuilt,
        price: input.price,
        pricePerUnit,
        opportunityType: input.opportunityType,
        propertyType: input.propertyType,
        urgencyLevel: input.urgencyLevel,
        score,
        dataSource: input.dataSource || 'Manual Entry',
        sourceUrl: input.sourceUrl,
        rawData: JSON.stringify({ notes: input.notes }),
        debtAmount: input.debtAmount,
        currentOwner: input.currentOwner,
        lender: input.lender,
        acquisitionDateByOwner: input.acquisitionDateByOwner,
        foreclosureStatus: input.foreclosureStatus,
        buyRationale: input.buyRationale,
      });
      
      return {
        success: true,
        propertyId: result.insertId,
      };
    }),

  /**
   * Bulk create properties from text/CSV
   */
  bulkCreate: publicProcedure
    .input(z.object({
      text: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
      
      const searchId = await getManualEntriesSearchId(db);
      
      // Parse the input text (simple CSV-like format)
      const lines = input.text.trim().split('\n').filter(line => line.trim());
      const properties: any[] = [];
      
      for (const line of lines) {
        // Skip header line if it exists
        if (line.toLowerCase().includes('property name') || line.toLowerCase().includes('city')) {
          continue;
        }
        
        // Simple comma-separated parsing
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 3) {
          const [propertyName, city, state, units, price] = parts;
          
          const unitsNum = units ? parseInt(units) : undefined;
          const priceNum = price ? parseFloat(price.replace(/[$,]/g, '')) : undefined;
          const pricePerUnit = priceNum && unitsNum ? Math.round(priceNum / unitsNum) : undefined;
          
          properties.push({
            searchId,
            propertyName,
            city,
            state: state || 'Unknown',
            units: unitsNum,
            price: priceNum,
            pricePerUnit,
            opportunityType: 'new_listing',
            propertyType: 'acquisition',
            urgencyLevel: 'developing',
            score: 60,
            dataSource: 'Bulk Upload',
            rawData: JSON.stringify({ originalLine: line }),
          });
        }
      }
      
      if (properties.length === 0) {
        throw new Error('No valid properties found in input');
      }
      
      // Insert all properties
      await db.insert(searchResults).values(properties);
      
      return {
        success: true,
        count: properties.length,
      };
      } catch (error) {
        console.error('Bulk create error:', error);
        throw error;
      }
    }),

  /**
   * List all manually added properties
   */
  list: publicProcedure
    .input(z.object({
      propertyType: z.enum(['acquisition', 'management_target']).optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      // Get the manual entries search ID
      const manualSearchId = await getManualEntriesSearchId(db);
      
      const conditions = [sql`${searchResults.searchId} = ${manualSearchId}`];
      
      if (input?.propertyType) {
        conditions.push(sql`${searchResults.propertyType} = ${input.propertyType}`);
      }
      
      const properties = await db.select()
        .from(searchResults)
        .where(sql.join(conditions, sql` AND `))
        .orderBy(desc(searchResults.createdAt));
      
      return properties;
    }),

  /**
   * Delete a property
   */
  delete: publicProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      await db.delete(searchResults).where(sql`id = ${input.id}`);
      
      return { success: true };
    }),
});

