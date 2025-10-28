import { invokeLLM } from '../_core/llm';

/**
 * Property Search Service
 * Implements intelligent property discovery using web search and LLM analysis
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
 * Execute property search using web search and LLM analysis
 */
export async function executePropertySearch(config: SearchConfig): Promise<PropertyResult[]> {
  const results: PropertyResult[] = [];
  
  try {
    // Phase 1: New Listings & Sales Opportunities
    const newListings = await searchNewListings(config);
    results.push(...newListings);
    
    // Phase 2: New Construction & Development (if deep search)
    if (config.searchDepth === 'deep') {
      const newConstruction = await searchNewConstruction(config);
      results.push(...newConstruction);
    }
    
    // Phase 3: Underperforming Properties (if deep search)
    if (config.searchDepth === 'deep') {
      const underperforming = await searchUnderperformingProperties(config);
      results.push(...underperforming);
    }
    
    // Phase 4: Company-Level Targets (if deep search)
    if (config.searchDepth === 'deep') {
      const companyTargets = await searchCompanyTargets(config);
      results.push(...companyTargets);
    }
    
    return results;
  } catch (error) {
    console.error('Property search error:', error);
    throw error;
  }
}

/**
 * Search for new listings and sales opportunities
 */
async function searchNewListings(config: SearchConfig): Promise<PropertyResult[]> {
  const searchQueries = [
    `${config.geographicArea} apartment building for sale ${config.minUnits}+ units`,
    `${config.geographicArea} multifamily property for sale`,
    `${config.geographicArea} commercial real estate multifamily`,
  ];
  
  const prompt = `You are a commercial real estate analyst. I need you to identify multifamily apartment properties for sale in ${config.geographicArea}.

Search Criteria:
- Location: ${config.geographicArea}
- Minimum Units: ${config.minUnits}
- Property Class: ${config.propertyClass}
- Timeframe: Recent listings (${config.timeframe})

Please provide a list of properties that match these criteria. For each property, extract:
1. Property Name
2. Address (if available)
3. City, State, Zip
4. Number of Units
5. Asking Price (if available)
6. Price per Unit (if calculable)
7. Property Class/Quality
8. Year Built (if available)
9. Occupancy Rate (if available)
10. Cap Rate (if available)
11. Days on Market (if available)
12. Source URL

Focus on properties listed on platforms like LoopNet, CoStar, Crexi, local MLS, or mentioned in recent news articles.

Return your findings as a JSON array with this structure:
[
  {
    "propertyName": "string",
    "address": "string or null",
    "city": "string",
    "state": "string",
    "zipCode": "string or null",
    "units": number or null,
    "propertyClass": "string or null",
    "yearBuilt": number or null,
    "price": number or null (in dollars),
    "pricePerUnit": number or null (in dollars),
    "occupancyRate": "string or null" (as percentage like "92.00"),
    "capRate": "string or null" (as percentage like "5.50"),
    "daysOnMarket": number or null,
    "dataSource": "string",
    "sourceUrl": "string or null",
    "notes": "string with additional context"
  }
]

If you cannot find real properties, return an empty array [].`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: 'You are a commercial real estate data analyst specializing in multifamily properties.' },
        { role: 'user', content: prompt }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'property_listings',
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
                    address: { type: ['string', 'null'] },
                    city: { type: 'string' },
                    state: { type: 'string' },
                    zipCode: { type: ['string', 'null'] },
                    units: { type: ['number', 'null'] },
                    propertyClass: { type: ['string', 'null'] },
                    yearBuilt: { type: ['number', 'null'] },
                    price: { type: ['number', 'null'] },
                    pricePerUnit: { type: ['number', 'null'] },
                    occupancyRate: { type: ['string', 'null'] },
                    capRate: { type: ['string', 'null'] },
                    daysOnMarket: { type: ['number', 'null'] },
                    dataSource: { type: 'string' },
                    sourceUrl: { type: ['string', 'null'] },
                    notes: { type: 'string' }
                  },
                  required: ['propertyName', 'city', 'state', 'dataSource', 'notes'],
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
    if (!content || typeof content !== 'string') return [];
    
    const parsed = JSON.parse(content);
    const properties = parsed.properties || [];
    
    // Convert to PropertyResult format with scoring
    return properties.map((prop: any) => {
      const score = calculateOpportunityScore(prop, 'new_listing');
      const urgency = determineUrgency(prop, score);
      
      return {
        propertyName: prop.propertyName,
        address: prop.address || undefined,
        city: prop.city,
        state: prop.state,
        zipCode: prop.zipCode || undefined,
        units: prop.units || undefined,
        propertyClass: prop.propertyClass || undefined,
        yearBuilt: prop.yearBuilt || undefined,
        price: prop.price || undefined,
        pricePerUnit: prop.pricePerUnit || undefined,
        opportunityType: 'new_listing' as const,
        urgencyLevel: urgency,
        occupancyRate: prop.occupancyRate || undefined,
        capRate: prop.capRate || undefined,
        daysOnMarket: prop.daysOnMarket || undefined,
        score,
        dataSource: prop.dataSource,
        sourceUrl: prop.sourceUrl || undefined,
        rawData: JSON.stringify(prop),
      };
    });
  } catch (error) {
    console.error('Error searching new listings:', error);
    return [];
  }
}

/**
 * Search for new construction and development projects
 */
async function searchNewConstruction(config: SearchConfig): Promise<PropertyResult[]> {
  const prompt = `You are a commercial real estate analyst tracking new multifamily construction in ${config.geographicArea}.

Find information about:
1. New apartment/multifamily projects breaking ground
2. Projects nearing completion
3. Recent building permits for multifamily developments
4. Construction announcements from developers

Criteria:
- Location: ${config.geographicArea}
- Minimum Units: ${config.minUnits}
- Property Class: ${config.propertyClass}

Return findings in the same JSON format as before, marking these as new construction opportunities.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: 'You are a commercial real estate development analyst.' },
        { role: 'user', content: prompt }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'construction_projects',
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
                    address: { type: ['string', 'null'] },
                    city: { type: 'string' },
                    state: { type: 'string' },
                    zipCode: { type: ['string', 'null'] },
                    units: { type: ['number', 'null'] },
                    propertyClass: { type: ['string', 'null'] },
                    yearBuilt: { type: ['number', 'null'] },
                    price: { type: ['number', 'null'] },
                    pricePerUnit: { type: ['number', 'null'] },
                    dataSource: { type: 'string' },
                    sourceUrl: { type: ['string', 'null'] },
                    notes: { type: 'string' }
                  },
                  required: ['propertyName', 'city', 'state', 'dataSource', 'notes'],
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
    if (!content || typeof content !== 'string') return [];
    
    const parsed = JSON.parse(content);
    const properties = parsed.properties || [];
    
    return properties.map((prop: any) => {
      const score = calculateOpportunityScore(prop, 'new_construction');
      
      return {
        propertyName: prop.propertyName,
        address: prop.address || undefined,
        city: prop.city,
        state: prop.state,
        zipCode: prop.zipCode || undefined,
        units: prop.units || undefined,
        propertyClass: prop.propertyClass || undefined,
        yearBuilt: prop.yearBuilt || undefined,
        price: prop.price || undefined,
        pricePerUnit: prop.pricePerUnit || undefined,
        opportunityType: 'new_construction' as const,
        urgencyLevel: 'future' as const, // New construction is typically future pipeline
        score,
        dataSource: prop.dataSource,
        sourceUrl: prop.sourceUrl || undefined,
        rawData: JSON.stringify(prop),
      };
    });
  } catch (error) {
    console.error('Error searching new construction:', error);
    return [];
  }
}

/**
 * Search for underperforming properties
 */
async function searchUnderperformingProperties(config: SearchConfig): Promise<PropertyResult[]> {
  const prompt = `You are a commercial real estate analyst identifying underperforming multifamily properties in ${config.geographicArea}.

Look for properties with indicators such as:
- Low occupancy rates (below 85%)
- Recent code violations or failed inspections
- Deferred maintenance visible in listings
- Below-market rents
- Recent insurance claims or liens
- High tenant turnover

Criteria:
- Location: ${config.geographicArea}
- Minimum Units: ${config.minUnits}

Return findings in JSON format.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: 'You are a commercial real estate distressed asset analyst.' },
        { role: 'user', content: prompt }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'underperforming_properties',
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
                    address: { type: ['string', 'null'] },
                    city: { type: 'string' },
                    state: { type: 'string' },
                    zipCode: { type: ['string', 'null'] },
                    units: { type: ['number', 'null'] },
                    occupancyRate: { type: ['string', 'null'] },
                    dataSource: { type: 'string' },
                    sourceUrl: { type: ['string', 'null'] },
                    notes: { type: 'string' }
                  },
                  required: ['propertyName', 'city', 'state', 'dataSource', 'notes'],
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
    if (!content || typeof content !== 'string') return [];
    
    const parsed = JSON.parse(content);
    const properties = parsed.properties || [];
    
    return properties.map((prop: any) => {
      const score = calculateOpportunityScore(prop, 'underperforming');
      const urgency = determineUrgency(prop, score);
      
      return {
        propertyName: prop.propertyName,
        address: prop.address || undefined,
        city: prop.city,
        state: prop.state,
        zipCode: prop.zipCode || undefined,
        units: prop.units || undefined,
        opportunityType: 'underperforming' as const,
        urgencyLevel: urgency,
        occupancyRate: prop.occupancyRate || undefined,
        score,
        dataSource: prop.dataSource,
        sourceUrl: prop.sourceUrl || undefined,
        rawData: JSON.stringify(prop),
      };
    });
  } catch (error) {
    console.error('Error searching underperforming properties:', error);
    return [];
  }
}

/**
 * Search for company-level acquisition targets
 */
async function searchCompanyTargets(config: SearchConfig): Promise<PropertyResult[]> {
  const prompt = `You are a commercial real estate M&A analyst identifying property management companies showing distress signals in ${config.geographicArea}.

Look for:
- Companies with recent layoffs or executive departures
- Firms showing financial distress
- Aging ownership looking to exit (65+ without succession)
- Family-owned firms in generational transitions
- Companies that lost major management contracts

Return any properties owned by these companies that might be acquisition targets.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: 'You are a commercial real estate M&A analyst.' },
        { role: 'user', content: prompt }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'company_targets',
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
                    dataSource: { type: 'string' },
                    sourceUrl: { type: ['string', 'null'] },
                    notes: { type: 'string' }
                  },
                  required: ['propertyName', 'city', 'state', 'dataSource', 'notes'],
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
    if (!content || typeof content !== 'string') return [];
    
    const parsed = JSON.parse(content);
    const properties = parsed.properties || [];
    
    return properties.map((prop: any) => {
      const score = calculateOpportunityScore(prop, 'company_distress');
      
      return {
        propertyName: prop.propertyName,
        city: prop.city,
        state: prop.state,
        units: prop.units || undefined,
        opportunityType: 'company_distress' as const,
        urgencyLevel: 'developing' as const,
        score,
        dataSource: prop.dataSource,
        sourceUrl: prop.sourceUrl || undefined,
        rawData: JSON.stringify(prop),
      };
    });
  } catch (error) {
    console.error('Error searching company targets:', error);
    return [];
  }
}

/**
 * Calculate opportunity score (0-100) based on various factors
 */
function calculateOpportunityScore(property: any, type: string): number {
  let score = 50; // Base score
  
  // Adjust based on opportunity type
  if (type === 'distressed_sale') score += 20;
  if (type === 'underperforming') score += 15;
  if (type === 'new_listing') score += 10;
  
  // Adjust based on occupancy (if available)
  if (property.occupancyRate) {
    const occupancy = parseFloat(property.occupancyRate);
    if (occupancy < 70) score += 15;
    else if (occupancy < 85) score += 10;
    else if (occupancy > 95) score -= 5;
  }
  
  // Adjust based on days on market (if available)
  if (property.daysOnMarket) {
    if (property.daysOnMarket > 90) score += 10;
    else if (property.daysOnMarket < 7) score += 5;
  }
  
  // Adjust based on cap rate (if available)
  if (property.capRate) {
    const capRate = parseFloat(property.capRate);
    if (capRate > 7) score += 10;
    else if (capRate > 6) score += 5;
  }
  
  // Ensure score is within 0-100 range
  return Math.max(0, Math.min(100, score));
}

/**
 * Determine urgency level based on property characteristics and score
 */
function determineUrgency(property: any, score: number): 'immediate' | 'developing' | 'future' {
  // High score properties with quick action needed
  if (score >= 80) return 'immediate';
  
  // Properties with distress signals
  if (property.occupancyRate && parseFloat(property.occupancyRate) < 70) return 'immediate';
  if (property.daysOnMarket && property.daysOnMarket > 90) return 'immediate';
  
  // Medium priority
  if (score >= 60) return 'developing';
  if (property.daysOnMarket && property.daysOnMarket > 30) return 'developing';
  
  // Lower priority or longer-term opportunities
  return 'future';
}

