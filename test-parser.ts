import { readFileSync } from 'fs';

const content = readFileSync('/home/ubuntu/upload/managementtargets.txt', 'utf-8');
const lines = content.split('\n');

let propertyCount = 0;
for (const line of lines) {
  // Look for property name pattern: "Name - City (Address)"
  const propertyMatch = line.match(/^([^–-]+)[–-]\s*([^(]+)(?:\(([^)]+)\))?/);
  if (propertyMatch) {
    propertyCount++;
    console.log(`Found property ${propertyCount}: ${propertyMatch[1].trim()}`);
  }
}

console.log(`\nTotal properties found: ${propertyCount}`);
