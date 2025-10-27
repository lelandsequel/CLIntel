import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { propertySearches, searchResults, marketMetrics } from '../../drizzle/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';

export const searchRouter = router({
  /**
   * Create a new property search
   */
  create: publicProcedure
    .input(z.object({
      name: z.string(),
      geographicArea: z.string(),
      propertyClass: z.string().optional(),
      minUnits: z.number().optional(),
      maxUnits: z.number().optional(),
      searchDepth: z.enum(['quick', 'deep']).optional(),
      timeframe: z.enum(['24h', '48h', '7d', '30d']).optional(),
      isRecurring: z.boolean().optional(),
      recurringSchedule: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const [result] = await db.insert(propertySearches).values({
        name: input.name,
        geographicArea: input.geographicArea,
        propertyClass: input.propertyClass || 'B- to A+',
        minUnits: input.minUnits || 100,
        maxUnits: input.maxUnits,
        searchDepth: input.searchDepth || 'quick',
        timeframe: input.timeframe || '48h',
        isRecurring: input.isRecurring || false,
        recurringSchedule: input.recurringSchedule,
        status: 'pending',
      });
      
      return {
        success: true,
        searchId: result.insertId,
      };
    }),

  /**
   * Get all property searches
   */
  list: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return [];
      
      const searches = await db.select()
        .from(propertySearches)
        .orderBy(desc(propertySearches.createdAt));
      
      return searches;
    }),

  /**
   * Get a specific search with results
   */
  get: publicProcedure
    .input(z.object({
      searchId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
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
        .where(eq(searchResults.searchId, input.searchId))
        .orderBy(desc(searchResults.score));
      
      // Group results by urgency level
      const immediate = results.filter(r => r.urgencyLevel === 'immediate');
      const developing = results.filter(r => r.urgencyLevel === 'developing');
      const future = results.filter(r => r.urgencyLevel === 'future');
      
      return {
        search: search[0],
        results: {
          all: results,
          immediate,
          developing,
          future,
        },
      };
    }),

  /**
   * Execute a property search
   */
  execute: publicProcedure
    .input(z.object({
      searchId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      // Update search status to running
      await db.update(propertySearches)
        .set({
          status: 'running',
          startedAt: new Date(),
        })
        .where(eq(propertySearches.id, input.searchId));
      
      try {
        // Get search configuration
        const search = await db.select()
          .from(propertySearches)
          .where(eq(propertySearches.id, input.searchId))
          .limit(1);
        
        if (search.length === 0) {
          throw new Error('Search not found');
        }
        
        const searchConfig = search[0];
        
        // TODO: Implement actual search logic
        // For now, we'll create some mock results
        const mockResults = await generateMockResults(searchConfig);
        
        // Insert results into database
        for (const result of mockResults) {
          await db.insert(searchResults).values({
            searchId: input.searchId,
            ...result,
          });
        }
        
        // Update search with completion status
        await db.update(propertySearches)
          .set({
            status: 'completed',
            completedAt: new Date(),
            totalResults: mockResults.length,
            immediateOpportunities: mockResults.filter(r => r.urgencyLevel === 'immediate').length,
            developingOpportunities: mockResults.filter(r => r.urgencyLevel === 'developing').length,
            futureOpportunities: mockResults.filter(r => r.urgencyLevel === 'future').length,
          })
          .where(eq(propertySearches.id, input.searchId));
        
        return {
          success: true,
          resultsCount: mockResults.length,
        };
      } catch (error) {
        // Update search with error status
        await db.update(propertySearches)
          .set({
            status: 'error',
            completedAt: new Date(),
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          })
          .where(eq(propertySearches.id, input.searchId));
        
        throw error;
      }
    }),

  /**
   * Delete a search and all results
   */
  delete: publicProcedure
    .input(z.object({
      searchId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      // Results will be cascade deleted
      await db.delete(propertySearches).where(eq(propertySearches.id, input.searchId));
      
      return { success: true };
    }),

  /**
   * Update search result status/notes
   */
  updateResult: publicProcedure
    .input(z.object({
      resultId: z.number(),
      status: z.enum(['new', 'reviewing', 'contacted', 'pursuing', 'passed', 'closed']).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const updates: any = {};
      if (input.status) updates.status = input.status;
      if (input.notes !== undefined) updates.notes = input.notes;
      
      await db.update(searchResults)
        .set(updates)
        .where(eq(searchResults.id, input.resultId));
      
      return { success: true };
    }),

  /**
   * Get market metrics for a specific area
   */
  getMarketMetrics: publicProcedure
    .input(z.object({
      marketName: z.string(),
      days: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      const days = input.days || 30;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const metrics = await db.select()
        .from(marketMetrics)
        .where(
          and(
            eq(marketMetrics.marketName, input.marketName),
            gte(marketMetrics.date, cutoffDate)
          )
        )
        .orderBy(desc(marketMetrics.date));
      
      return metrics;
    }),
});

/**
 * Generate mock search results for testing
 * TODO: Replace with actual search implementation
 */
async function generateMockResults(searchConfig: any) {
  const mockProperties = [
    {
      propertyName: 'Riverside Apartments',
      address: '123 River St',
      city: searchConfig.geographicArea.split(',')[0],
      state: 'TX',
      zipCode: '75001',
      units: 150,
      propertyClass: 'B+',
      yearBuilt: 2010,
      price: 18000000,
      pricePerUnit: 120000,
      opportunityType: 'new_listing' as const,
      urgencyLevel: 'immediate' as const,
      occupancyRate: '92.00',
      capRate: '5.50',
      daysOnMarket: 5,
      score: 85,
      dataSource: 'LoopNet',
      sourceUrl: 'https://loopnet.com/example',
      rawData: JSON.stringify({ source: 'mock' }),
    },
    {
      propertyName: 'Sunset Gardens',
      address: '456 Sunset Blvd',
      city: searchConfig.geographicArea.split(',')[0],
      state: 'TX',
      zipCode: '75002',
      units: 200,
      propertyClass: 'A-',
      yearBuilt: 2015,
      price: 30000000,
      pricePerUnit: 150000,
      opportunityType: 'underperforming' as const,
      urgencyLevel: 'developing' as const,
      occupancyRate: '78.00',
      capRate: '6.20',
      daysOnMarket: 45,
      score: 72,
      dataSource: 'CoStar',
      sourceUrl: 'https://costar.com/example',
      rawData: JSON.stringify({ source: 'mock' }),
    },
    {
      propertyName: 'Oak Hill Commons',
      address: '789 Oak Hill Dr',
      city: searchConfig.geographicArea.split(',')[0],
      state: 'TX',
      zipCode: '75003',
      units: 120,
      propertyClass: 'B',
      yearBuilt: 2008,
      price: 12000000,
      pricePerUnit: 100000,
      opportunityType: 'distressed_sale' as const,
      urgencyLevel: 'immediate' as const,
      occupancyRate: '65.00',
      capRate: '7.50',
      daysOnMarket: 90,
      score: 90,
      dataSource: 'Auction.com',
      sourceUrl: 'https://auction.com/example',
      rawData: JSON.stringify({ source: 'mock' }),
    },
    {
      propertyName: 'Metro Plaza',
      address: '321 Metro Way',
      city: searchConfig.geographicArea.split(',')[0],
      state: 'TX',
      zipCode: '75004',
      units: 180,
      propertyClass: 'A',
      yearBuilt: 2020,
      price: 36000000,
      pricePerUnit: 200000,
      opportunityType: 'new_construction' as const,
      urgencyLevel: 'future' as const,
      occupancyRate: '45.00',
      capRate: '4.80',
      daysOnMarket: 0,
      score: 65,
      dataSource: 'Crexi',
      sourceUrl: 'https://crexi.com/example',
      rawData: JSON.stringify({ source: 'mock' }),
    },
  ];
  
  // Filter by min units
  return mockProperties.filter(p => p.units >= (searchConfig.minUnits || 0));
}

