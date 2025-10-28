import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { searchResults } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import {
  generatePropertyValuation,
  generateInvestmentAnalysis,
  generateMarketInsights,
  generateComprehensiveAnalysis,
} from '../services/propertyAnalysisService';

export const analysisRouter = router({
  /**
   * Generate property valuation
   */
  generateValuation: publicProcedure
    .input(z.object({
      resultId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Get property result
      const result = await db.select()
        .from(searchResults)
        .where(eq(searchResults.id, input.resultId))
        .limit(1);

      if (result.length === 0) {
        throw new Error('Property not found');
      }

      const property = result[0];

      // Generate valuation
      const valuation = await generatePropertyValuation({
        propertyName: property.propertyName,
        address: property.address ?? undefined,
        city: property.city || 'Unknown',
        state: property.state || 'Unknown',
        units: property.units ?? undefined,
        propertyClass: property.propertyClass ?? undefined,
        yearBuilt: property.yearBuilt ?? undefined,
        price: property.price ?? undefined,
        pricePerUnit: property.pricePerUnit ?? undefined,
        occupancyRate: property.occupancyRate ?? undefined,
        capRate: property.capRate ?? undefined,
        opportunityType: property.opportunityType,
        rawData: property.rawData ?? undefined,
      });

      return valuation;
    }),

  /**
   * Generate investment analysis
   */
  generateInvestmentAnalysis: publicProcedure
    .input(z.object({
      resultId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const result = await db.select()
        .from(searchResults)
        .where(eq(searchResults.id, input.resultId))
        .limit(1);

      if (result.length === 0) {
        throw new Error('Property not found');
      }

      const property = result[0];

      const analysis = await generateInvestmentAnalysis({
        propertyName: property.propertyName,
        address: property.address ?? undefined,
        city: property.city || 'Unknown',
        state: property.state || 'Unknown',
        units: property.units ?? undefined,
        propertyClass: property.propertyClass ?? undefined,
        yearBuilt: property.yearBuilt ?? undefined,
        price: property.price ?? undefined,
        pricePerUnit: property.pricePerUnit ?? undefined,
        occupancyRate: property.occupancyRate ?? undefined,
        capRate: property.capRate ?? undefined,
        opportunityType: property.opportunityType,
        rawData: property.rawData ?? undefined,
      });

      return analysis;
    }),

  /**
   * Generate market insights
   */
  generateMarketInsights: publicProcedure
    .input(z.object({
      city: z.string(),
      state: z.string(),
    }))
    .mutation(async ({ input }) => {
      const insights = await generateMarketInsights(input.city, input.state);
      return insights;
    }),

  /**
   * Generate comprehensive analysis
   */
  generateComprehensive: publicProcedure
    .input(z.object({
      resultId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const result = await db.select()
        .from(searchResults)
        .where(eq(searchResults.id, input.resultId))
        .limit(1);

      if (result.length === 0) {
        throw new Error('Property not found');
      }

      const property = result[0];

      const analysis = await generateComprehensiveAnalysis({
        propertyName: property.propertyName,
        address: property.address ?? undefined,
        city: property.city || 'Unknown',
        state: property.state || 'Unknown',
        units: property.units ?? undefined,
        propertyClass: property.propertyClass ?? undefined,
        yearBuilt: property.yearBuilt ?? undefined,
        price: property.price ?? undefined,
        pricePerUnit: property.pricePerUnit ?? undefined,
        occupancyRate: property.occupancyRate ?? undefined,
        capRate: property.capRate ?? undefined,
        opportunityType: property.opportunityType,
        rawData: property.rawData ?? undefined,
      });

      return analysis;
    }),
});

