import { searchGoogle } from './server/services/dataForSeoService';

async function test() {
  console.log('Testing DataForSEO API...');
  
  try {
    const results = await searchGoogle('Houston TX apartment building for sale 100+ units', 'United States');
    console.log('\n=== SEARCH RESULTS ===');
    console.log(`Found ${results.length} results`);
    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
  }
}

test();

