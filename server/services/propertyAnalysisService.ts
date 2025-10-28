import { invokeLLM } from '../_core/llm';

/**
 * Property Analysis Service
 * Provides AI-powered property valuation, market analysis, and investment insights
 */

export interface PropertyAnalysisInput {
  propertyName: string;
  address?: string;
  city: string;
  state: string;
  units?: number;
  propertyClass?: string;
  yearBuilt?: number;
  price?: number;
  pricePerUnit?: number;
  occupancyRate?: string;
  capRate?: string;
  opportunityType: string;
  rawData?: string;
}

export interface PropertyValuation {
  estimatedValue: number;
  valuationRange: {
    low: number;
    high: number;
  };
  confidence: 'high' | 'medium' | 'low';
  methodology: string;
  comparables: string[];
  assumptions: string[];
}

export interface InvestmentAnalysis {
  recommendedAction: 'strong_buy' | 'buy' | 'hold' | 'pass';
  investmentScore: number; // 0-100
  strengths: string[];
  risks: string[];
  opportunities: string[];
  threats: string[];
  keyMetrics: {
    projectedROI?: string;
    breakEvenYears?: number;
    valueAddPotential?: string;
  };
}

export interface MarketInsights {
  marketTrend: 'hot' | 'warming' | 'stable' | 'cooling' | 'cold';
  demandLevel: 'very_high' | 'high' | 'moderate' | 'low' | 'very_low';
  competitionLevel: 'very_high' | 'high' | 'moderate' | 'low' | 'very_low';
  priceDirection: 'rising' | 'stable' | 'declining';
  insights: string[];
  marketDrivers: string[];
}

/**
 * Generate AI-powered property valuation
 */
export async function generatePropertyValuation(property: PropertyAnalysisInput): Promise<PropertyValuation> {
  const prompt = `You are a commercial real estate appraiser specializing in multifamily properties. Provide a valuation estimate for the following property:

Property Details:
- Name: ${property.propertyName}
- Location: ${property.city}, ${property.state}
${property.address ? `- Address: ${property.address}` : ''}
${property.units ? `- Units: ${property.units}` : ''}
${property.propertyClass ? `- Class: ${property.propertyClass}` : ''}
${property.yearBuilt ? `- Year Built: ${property.yearBuilt}` : ''}
${property.price ? `- Listed Price: $${property.price.toLocaleString()}` : ''}
${property.pricePerUnit ? `- Price/Unit: $${property.pricePerUnit.toLocaleString()}` : ''}
${property.occupancyRate ? `- Occupancy: ${property.occupancyRate}%` : ''}
${property.capRate ? `- Cap Rate: ${property.capRate}%` : ''}

Based on market conditions, comparable sales, and property characteristics, provide:
1. Estimated market value
2. Valuation range (low to high)
3. Confidence level (high/medium/low)
4. Methodology used
5. Key assumptions
6. Comparable properties considered

Return your analysis in JSON format.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: 'You are a certified commercial real estate appraiser with expertise in multifamily property valuation.' },
        { role: 'user', content: prompt }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'property_valuation',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              estimatedValue: { type: 'number', description: 'Estimated market value in dollars' },
              valuationRange: {
                type: 'object',
                properties: {
                  low: { type: 'number' },
                  high: { type: 'number' }
                },
                required: ['low', 'high'],
                additionalProperties: false
              },
              confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
              methodology: { type: 'string', description: 'Valuation methodology used' },
              comparables: {
                type: 'array',
                items: { type: 'string' },
                description: 'List of comparable properties'
              },
              assumptions: {
                type: 'array',
                items: { type: 'string' },
                description: 'Key assumptions made'
              }
            },
            required: ['estimatedValue', 'valuationRange', 'confidence', 'methodology', 'comparables', 'assumptions'],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0].message.content;
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid response from LLM');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating property valuation:', error);
    throw error;
  }
}

/**
 * Generate investment analysis and recommendations
 */
export async function generateInvestmentAnalysis(property: PropertyAnalysisInput): Promise<InvestmentAnalysis> {
  const prompt = `You are an experienced commercial real estate investment analyst. Analyze this multifamily property opportunity:

Property Details:
- Name: ${property.propertyName}
- Location: ${property.city}, ${property.state}
${property.units ? `- Units: ${property.units}` : ''}
${property.propertyClass ? `- Class: ${property.propertyClass}` : ''}
${property.price ? `- Price: $${property.price.toLocaleString()}` : ''}
${property.pricePerUnit ? `- Price/Unit: $${property.pricePerUnit.toLocaleString()}` : ''}
${property.occupancyRate ? `- Occupancy: ${property.occupancyRate}%` : ''}
${property.capRate ? `- Cap Rate: ${property.capRate}%` : ''}
- Opportunity Type: ${property.opportunityType}

Provide a comprehensive investment analysis including:
1. Recommended action (strong_buy/buy/hold/pass)
2. Investment score (0-100)
3. SWOT analysis (Strengths, Weaknesses, Opportunities, Threats)
4. Key investment metrics (projected ROI, break-even timeline, value-add potential)

Return your analysis in JSON format.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: 'You are a senior commercial real estate investment analyst with 20+ years of experience in multifamily acquisitions.' },
        { role: 'user', content: prompt }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'investment_analysis',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              recommendedAction: { type: 'string', enum: ['strong_buy', 'buy', 'hold', 'pass'] },
              investmentScore: { type: 'number', description: 'Score from 0-100' },
              strengths: { type: 'array', items: { type: 'string' } },
              risks: { type: 'array', items: { type: 'string' } },
              opportunities: { type: 'array', items: { type: 'string' } },
              threats: { type: 'array', items: { type: 'string' } },
              keyMetrics: {
                type: 'object',
                properties: {
                  projectedROI: { type: ['string', 'null'] },
                  breakEvenYears: { type: ['number', 'null'] },
                  valueAddPotential: { type: ['string', 'null'] }
                },
                required: [],
                additionalProperties: false
              }
            },
            required: ['recommendedAction', 'investmentScore', 'strengths', 'risks', 'opportunities', 'threats', 'keyMetrics'],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0].message.content;
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid response from LLM');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating investment analysis:', error);
    throw error;
  }
}

/**
 * Generate market insights for the property location
 */
export async function generateMarketInsights(city: string, state: string): Promise<MarketInsights> {
  const prompt = `You are a commercial real estate market analyst. Provide current market insights for multifamily properties in ${city}, ${state}.

Analyze:
1. Overall market trend (hot/warming/stable/cooling/cold)
2. Demand level for multifamily housing
3. Competition level among buyers
4. Price direction (rising/stable/declining)
5. Key market insights and observations
6. Primary market drivers

Return your analysis in JSON format.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: 'You are a commercial real estate market research analyst specializing in multifamily housing markets.' },
        { role: 'user', content: prompt }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'market_insights',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              marketTrend: { type: 'string', enum: ['hot', 'warming', 'stable', 'cooling', 'cold'] },
              demandLevel: { type: 'string', enum: ['very_high', 'high', 'moderate', 'low', 'very_low'] },
              competitionLevel: { type: 'string', enum: ['very_high', 'high', 'moderate', 'low', 'very_low'] },
              priceDirection: { type: 'string', enum: ['rising', 'stable', 'declining'] },
              insights: { type: 'array', items: { type: 'string' } },
              marketDrivers: { type: 'array', items: { type: 'string' } }
            },
            required: ['marketTrend', 'demandLevel', 'competitionLevel', 'priceDirection', 'insights', 'marketDrivers'],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0].message.content;
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid response from LLM');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating market insights:', error);
    throw error;
  }
}

/**
 * Generate comprehensive property report combining all analyses
 */
export async function generateComprehensiveAnalysis(property: PropertyAnalysisInput) {
  try {
    const [valuation, investment, market] = await Promise.all([
      generatePropertyValuation(property),
      generateInvestmentAnalysis(property),
      generateMarketInsights(property.city, property.state),
    ]);

    return {
      property,
      valuation,
      investment,
      market,
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error('Error generating comprehensive analysis:', error);
    throw error;
  }
}

