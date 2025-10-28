import { invokeLLM } from '../_core/llm';
import { searchMultifamilyProperties, SerpSearchResult } from './dataForSeoService';

/**
 * Property Search Service
 * Two-step process: 1) DataForSEO search, 2) LLM analysis (separate)
 */

export interface SearchConfig {
  geographicArea: string;
  propertyClass: string;
  minUnits: number;
  maxUnits?: number;
  searchDepth: 'quick' | 'deep';
  timeframe: '24h' | '48h' | '7d' | '30d';
}

export interface PropertyResult {
  propertyName: string;
  address?: string;
  city: string;
  state: string;
  zipCode?: string;
  units?: number;
  propertyClass?: string;
  yearBuilt?: number;
  price?: number;
  pricePerUnit?: number;
  opportunityType: 'new_listing' | 'distressed_sale' | 'new_construction' | 'underperforming' | 'company_distress' | 'off_market';
  urgencyLevel: 'immediate' | 'developing' | 'future';
  occupancyRate?: string;
  capRate?: string;
  daysOnMarket?: number;
  score: number;
  dataSource: string;
  sourceUrl?: string;
  rawData: string;
}

/**
 * STEP 1: Execute property search using DataForSEO only
 * Returns raw search results immediately
 */
export async function executePropertySearch(config: SearchConfig): Promise<PropertyResult[]> {
  const results: PropertyResult[] = [];
  
  try {
    // Search for different opportunity types
    const opportunityTypes = config.searchDepth === 'deep' 
      ? ['new_listing', 'new_construction', 'underperforming', 'off_market']
      : ['new_listing', 'underperforming'];
    
    for (const oppType of opportunityTypes) {
      try {
        console.log(`[Search] Searching for ${oppType} in ${config.geographicArea}...`);
        const searchResults = await searchMultifamilyProperties(
          config.geographicArea,
          config.minUnits,
          oppType
        );
        
        console.log(`[Search] Found ${searchResults.length} results for ${oppType}`);
        
        // Convert raw search results to PropertyResult format
        const properties = searchResults.map((result, idx) => {
          const score = 50 + (searchResults.length - idx) * 2; // Higher score for top results
          const urgency: 'immediate' | 'developing' | 'future' = 
            score >= 70 ? 'immediate' : score >= 50 ? 'developing' : 'future';
          
          return {
            propertyName: result.title,
            city: config.geographicArea.split(',')[0]?.trim() || 'Unknown',
            state: config.geographicArea.split(',')[1]?.trim() || config.geographicArea,
            opportunityType: oppType as any,
            urgencyLevel: urgency,
            score,
            dataSource: result.domain,
            sourceUrl: result.url,
            rawData: JSON.stringify(result),
          } as PropertyResult;
        });
        
        results.push(...properties);
      } catch (error) {
        console.error(`[Search] Error searching ${oppType}:`, error);
        // Continue with other types even if one fails
      }
    }
    
    console.log(`[Search] Total results: ${results.length}`);
    return results;
  } catch (error) {
    console.error('[Search] Error executing property search:', error);
    throw error;
  }
}

/**
 * STEP 2: Enhance existing search results with LLM analysis
 * Can be called separately and retried if it fails
 */
export async function enhanceResultsWithAI(
  searchResults: PropertyResult[],
  config: SearchConfig
): Promise<PropertyResult[]> {
  console.log(`[AI Enhancement] Analyzing ${searchResults.length} results...`);
  
  const enhanced: PropertyResult[] = [];
  
  // Process in batches to avoid overwhelming the LLM
  const batchSize = 5;
  for (let i = 0; i < searchResults.length; i += batchSize) {
    const batch = searchResults.slice(i, i + batchSize);
    
    try {
      const enhancedBatch = await enhanceBatchWithAI(batch, config);
      enhanced.push(...enhancedBatch);
    } catch (error) {
      console.error(`[AI Enhancement] Error enhancing batch ${i / batchSize + 1}:`, error);
      // Return original results if AI enhancement fails
      enhanced.push(...batch);
    }
  }
  
  return enhanced;
}

/**
 * Enhance a batch of results with AI analysis
 */
async function enhanceBatchWithAI(
  results: PropertyResult[],
  config: SearchConfig
): Promise<PropertyResult[]> {
  const searchContext = results.map((result, idx) => {
    const rawData = JSON.parse(result.rawData);
    return `[${idx + 1}] ${result.propertyName}\nURL: ${result.sourceUrl}\nDescription: ${rawData.description || 'N/A'}\n`;
  }).join('\n');
  
  const prompt = `Analyze these multifamily property search results and extract detailed information.

Search Results:
${searchContext}

For each property, try to extract:
- Property name
- Location (city, state, zip if available)
- Number of units (if mentioned)
- Price (if mentioned, in dollars)
- Property class/quality
- Year built (if mentioned)
- Any other relevant details

Return as JSON array with extracted details.`;

  try {
    const response = await invokeLLM({
      messages: [
        { 
          role: 'system', 
          content: 'You are a commercial real estate analyst extracting property information from search results.' 
        },
        { role: 'user', content: prompt }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'enhanced_properties',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              properties: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    index: { type: 'number' },
                    units: { type: ['number', 'null'] },
                    price: { type: ['number', 'null'] },
                    propertyClass: { type: ['string', 'null'] },
                    yearBuilt: { type: ['number', 'null'] },
                    notes: { type: 'string' }
                  },
                  required: ['index', 'notes'],
                  additionalProperties: false
                }
              }
            },
            required: ['properties'],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0].message.content;
    if (!content || typeof content !== 'string') {
      return results; // Return original if parsing fails
    }
    
    const parsed = JSON.parse(content);
    const enhancements = parsed.properties || [];
    
    // Merge enhancements with original results
    return results.map((result, idx) => {
      const enhancement = enhancements.find((e: any) => e.index === idx + 1);
      if (!enhancement) return result;
      
      const pricePerUnit = enhancement.price && enhancement.units 
        ? Math.round(enhancement.price / enhancement.units) 
        : undefined;
      
      return {
        ...result,
        units: enhancement.units || result.units,
        price: enhancement.price || result.price,
        pricePerUnit: pricePerUnit || result.pricePerUnit,
        propertyClass: enhancement.propertyClass || result.propertyClass,
        yearBuilt: enhancement.yearBuilt || result.yearBuilt,
      };
    });
  } catch (error) {
    console.error('[AI Enhancement] LLM analysis failed:', error);
    // Return original results if AI fails
    return results;
  }
}

