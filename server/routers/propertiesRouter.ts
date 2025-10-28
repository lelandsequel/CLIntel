import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { searchResults } from '../../drizzle/schema';
import { desc, sql } from 'drizzle-orm';

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
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const pricePerUnit = input.price && input.units ? Math.round(input.price / input.units) : undefined;
      const score = input.urgencyLevel === 'immediate' ? 80 : input.urgencyLevel === 'developing' ? 60 : 40;
      
      const [result] = await db.insert(searchResults).values({
        searchId: 0, // Manual entry, not from a search
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
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
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
            searchId: 0,
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
      
      const conditions = [sql`${searchResults.searchId} = 0`];
      
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

