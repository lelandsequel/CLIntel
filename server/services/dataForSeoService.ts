/**
 * DataForSEO Service
 * Integrates with DataForSEO API for real property search using SERP
 */

const DATAFORSEO_API_URL = 'https://api.dataforseo.com/v3';

interface DataForSEOCredentials {
  login: string;
  password: string;
}

function getCredentials(): DataForSEOCredentials {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  
  if (!login || !password) {
    throw new Error('DataForSEO credentials not configured');
  }
  
  return { login, password };
}

function getAuthHeader(): string {
  const { login, password } = getCredentials();
  const credentials = Buffer.from(`${login}:${password}`).toString('base64');
  return `Basic ${credentials}`;
}

export interface SerpSearchResult {
  title: string;
  url: string;
  description: string;
  domain: string;
}

/**
 * Search Google using DataForSEO SERP API
 */
export async function searchGoogle(query: string, location: string = 'United States'): Promise<SerpSearchResult[]> {
  try {
    const response = await fetch(`${DATAFORSEO_API_URL}/serp/google/organic/live/advanced`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{
        keyword: query,
        location_name: location,
        language_code: 'en',
        device: 'desktop',
        os: 'windows',
        depth: 20, // Get top 20 results
      }]),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DataForSEO API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.tasks || data.tasks.length === 0) {
      return [];
    }

    const task = data.tasks[0];
    if (task.status_code !== 20000) {
      throw new Error(`DataForSEO task failed: ${task.status_message}`);
    }

    const results = task.result?.[0]?.items || [];
    
    return results
      .filter((item: any) => item.type === 'organic')
      .map((item: any) => ({
        title: item.title || '',
        url: item.url || '',
        description: item.description || '',
        domain: item.domain || '',
      }));
  } catch (error) {
    console.error('Error searching Google via DataForSEO:', error);
    throw error;
  }
}

/**
 * Search for multifamily properties in a specific area
 */
export async function searchMultifamilyProperties(
  geographicArea: string,
  minUnits: number,
  opportunityType: string
): Promise<SerpSearchResult[]> {
  const queries = generateSearchQueries(geographicArea, minUnits, opportunityType);
  const allResults: SerpSearchResult[] = [];
  
  for (const query of queries) {
    try {
      const results = await searchGoogle(query, geographicArea);
      allResults.push(...results);
      
      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error searching for "${query}":`, error);
    }
  }
  
  // Deduplicate by URL
  const uniqueResults = Array.from(
    new Map(allResults.map(item => [item.url, item])).values()
  );
  
  return uniqueResults;
}

/**
 * Generate search queries based on opportunity type
 */
function generateSearchQueries(area: string, minUnits: number, opportunityType: string): string[] {
  const baseQueries: Record<string, string[]> = {
    new_listing: [
      `${area} apartment building for sale ${minUnits}+ units`,
      `${area} multifamily property for sale`,
      `${area} apartment complex for sale`,
      `site:loopnet.com ${area} multifamily`,
      `site:crexi.com ${area} apartment`,
    ],
    new_construction: [
      `${area} new apartment construction`,
      `${area} multifamily development project`,
      `${area} apartment building permit`,
      `${area} new multifamily construction`,
    ],
    underperforming: [
      `${area} distressed apartment building`,
      `${area} value add multifamily`,
      `${area} apartment building low occupancy`,
      `${area} multifamily renovation opportunity`,
    ],
    company_distress: [
      `${area} apartment management company bankruptcy`,
      `${area} multifamily portfolio sale`,
      `${area} apartment owner distressed`,
    ],
    off_market: [
      `${area} off market multifamily`,
      `${area} apartment building owner`,
      `${area} multifamily investment opportunity`,
    ],
  };
  
  return baseQueries[opportunityType] || baseQueries.new_listing;
}

