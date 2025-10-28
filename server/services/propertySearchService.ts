import { invokeLLM } from '../_core/llm';
import { searchMultifamilyProperties, SerpSearchResult } from './dataForSeoService';

/**
 * Property Search Service
 * Uses DataForSEO SERP API + LLM to find and analyze real multifamily properties
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
 * Execute property search using DataForSEO + LLM analysis
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
        const properties = await searchPropertiesByType(config, oppType);
        results.push(...properties);
      } catch (error) {
        console.error(`Error searching ${oppType}:`, error);
        // Continue with other types even if one fails
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error executing property search:', error);
    throw error;
  }
}

/**
 * Search for properties of a specific opportunity type
 */
async function searchPropertiesByType(
  config: SearchConfig,
  opportunityType: string
): Promise<PropertyResult[]> {
  // Step 1: Get search results from DataForSEO
  const searchResults = await searchMultifamilyProperties(
    config.geographicArea,
    config.minUnits,
    opportunityType
  );
  
  if (searchResults.length === 0) {
    return [];
  }
  
  // Step 2: Use LLM to extract property details from search results
  const properties = await extractPropertiesFromSearchResults(
    searchResults,
    config,
    opportunityType
  );
  
  return properties;
}

/**
 * Use LLM to extract structured property data from search results
 */
async function extractPropertiesFromSearchResults(
  searchResults: SerpSearchResult[],
  config: SearchConfig,
  opportunityType: string
): Promise<PropertyResult[]> {
  // Take top 10 results to avoid overwhelming the LLM
  const topResults = searchResults.slice(0, 10);
  
  const searchContext = topResults.map((result, idx) => 
    `[${idx + 1}] ${result.title}\nURL: ${result.url}\nDescription: ${result.description}\nDomain: ${result.domain}\n`
  ).join('\n');
  
  const prompt = `Analyze these search results for multifamily properties in ${config.geographicArea} and extract property details.

Search Results:
${searchContext}

Extract information for each property found. For each property, provide:
- Property name (from title or description)
- Location (city, state)
- Number of units (if mentioned)
- Price (if mentioned, in dollars)
- Any other relevant details

Only include properties that appear to be real multifamily/apartment properties (${config.minUnits}+ units). Skip general listings, news articles, or non-property results.

Return as JSON array with extracted properties.`;

  try {
    const response = await invokeLLM({
      messages: [
        { 
          role: 'system', 
          content: 'You are a commercial real estate analyst extracting property information from search results. Be conservative - only extract properties you are confident about from the provided data.' 
        },
        { role: 'user', content: prompt }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'extracted_properties',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              properties: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    propertyName: { type: 'string' },
                    city: { type: 'string' },
                    state: { type: 'string' },
                    units: { type: ['number', 'null'] },
                    price: { type: ['number', 'null'] },
                    sourceUrl: { type: 'string' },
                    notes: { type: 'string' }
                  },
                  required: ['propertyName', 'city', 'state', 'sourceUrl', 'notes'],
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
      return [];
    }
    
    const parsed = JSON.parse(content);
    const properties = parsed.properties || [];
    
    // Convert to PropertyResult format with scoring
    return properties.map((prop: any) => {
      const score = calculateOpportunityScore(prop, opportunityType);
      const urgency = determineUrgency(prop, score, opportunityType);
      const pricePerUnit = prop.price && prop.units ? Math.round(prop.price / prop.units) : undefined;
      
      // Find matching search result for data source
      const matchingResult = searchResults.find(r => r.url === prop.sourceUrl);
      const dataSource = matchingResult?.domain || 'Web Search';
      
      return {
        propertyName: prop.propertyName,
        city: prop.city,
        state: prop.state,
        units: prop.units || undefined,
        price: prop.price || undefined,
        pricePerUnit,
        opportunityType: opportunityType as any,
        urgencyLevel: urgency,
        score,
        dataSource,
        sourceUrl: prop.sourceUrl,
        rawData: JSON.stringify({ ...prop, searchResult: matchingResult }),
      } as PropertyResult;
    });
  } catch (error) {
    console.error('Error extracting properties from search results:', error);
    return [];
  }
}

/**
 * Calculate opportunity score based on various factors
 */
function calculateOpportunityScore(property: any, type: string): number {
  let score = 50; // Base score
  
  // Adjust based on opportunity type
  const typeScores: Record<string, number> = {
    'new_listing': 10,
    'distressed_sale': 20,
    'new_construction': 5,
    'underperforming': 25,
    'company_distress': 30,
    'off_market': 15,
  };
  score += typeScores[type] || 0;
  
  // Bonus for having price data
  if (property.price) score += 10;
  
  // Bonus for having unit count
  if (property.units) score += 10;
  
  // Bonus for price per unit in reasonable range
  if (property.price && property.units) {
    const ppu = property.price / property.units;
    if (ppu < 200000) score += 15; // Good value
  }
  
  // Ensure score is within 0-100 range
  return Math.min(100, Math.max(0, score));
}

/**
 * Determine urgency level based on property characteristics and score
 */
function determineUrgency(property: any, score: number, type: string): 'immediate' | 'developing' | 'future' {
  // Immediate: High score + certain opportunity types
  if (score >= 75) return 'immediate';
  if (type === 'distressed_sale' || type === 'company_distress') return 'immediate';
  
  // Developing: Medium score or development opportunities
  if (score >= 50) return 'developing';
  if (type === 'new_construction') return 'developing';
  
  // Future: Lower score or longer-term opportunities
  return 'future';
}

