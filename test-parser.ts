import { parseAIQFile, parseRedIQFile } from './server/utils/excelParser';
import * as fs from 'fs';

async function testParsers() {
  console.log('Testing Excel Parsers...\n');
  
  // Test AIQ parser
  try {
    const aiqBuffer = fs.readFileSync('./sample-data/ApartmentIQINPUT.xlsx');
    const aiqData = parseAIQFile(aiqBuffer);
    console.log('✅ AIQ Parser Success!');
    console.log(`   Parsed ${aiqData.length} rows`);
    console.log('   Sample row:', JSON.stringify(aiqData[0], null, 2));
    console.log('');
  } catch (error) {
    console.error('❌ AIQ Parser Failed:', error);
  }
  
  // Test RedIQ parser
  try {
    const rediqBuffer = fs.readFileSync('./sample-data/RedIQINPUT.xlsx');
    const rediqData = parseRedIQFile(rediqBuffer);
    console.log('✅ RedIQ Parser Success!');
    console.log(`   Parsed ${rediqData.length} rows`);
    console.log('   Sample row:', JSON.stringify(rediqData[0], null, 2));
  } catch (error) {
    console.error('❌ RedIQ Parser Failed:', error);
  }
}

testParsers();
