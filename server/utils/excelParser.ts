import * as XLSX from 'xlsx';

export interface AIQFloorPlanData {
  property: string;
  floorPlan: string;
  bedCount: number | null;
  bathCount: number | null;
  sqFt: number | null;
  totalUnits: number | null;
  availableUnits: number | null;
  availableAskingRent: number | null;
}

export interface RedIQFloorPlanData {
  floorPlan: string;
  bed: number | null;
  bath: number | null;
  netSf: number | null;
  units: number | null;
  marketRent: number | null;
  inPlaceRent: number | null;
  columnS: string | null; // Recent 5 leases or other data
}

/**
 * Parse ApartmentIQ Excel file
 * Extracts data from "Floor Plan Data" tab, columns A-F, N-O
 */
export function parseAIQFile(buffer: Buffer): AIQFloorPlanData[] {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    
    // Find "Floor Plan Data" sheet
    const sheetName = workbook.SheetNames.find(name => 
      name.toLowerCase().includes('floor') && name.toLowerCase().includes('plan') && name.toLowerCase().includes('data')
    );
    
    if (!sheetName) {
      throw new Error('Could not find "Floor Plan Data" sheet in AIQ file');
    }
    
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
    
    // Find header row (usually row with "Property")
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(10, jsonData.length); i++) {
      const row = jsonData[i] as any[];
      if (row[0] === 'Property' || (typeof row[0] === 'string' && row[0].includes('Property'))) {
        headerRowIndex = i;
        break;
      }
    }
    
    if (headerRowIndex === -1) {
      throw new Error('Could not find header row in AIQ file');
    }
    
    const results: AIQFloorPlanData[] = [];
    
    // Process data rows (skip header)
    for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      
      // Skip empty rows
      if (!row || !row[0]) continue;
      
      // Columns: A=0, B=1, C=2, D=3, E=4, F=5, N=13, O=14
      const property = row[0] ? String(row[0]).trim() : '';
      
      // Skip if property is empty or looks like a header
      if (!property || property.toLowerCase().includes('property')) continue;
      
      results.push({
        property,
        floorPlan: row[1] ? String(row[1]).trim() : '',
        bedCount: parseNumber(row[2]),
        bathCount: parseNumber(row[3]),
        sqFt: parseNumber(row[4]),
        totalUnits: parseNumber(row[5]),
        availableUnits: parseNumber(row[13]),
        availableAskingRent: parseNumber(row[14]),
      });
    }
    
    return results;
  } catch (error) {
    throw new Error(`Failed to parse AIQ file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse RedIQ Excel file
 * Extracts data from "Floor Plan Summary" tab, columns A, D-G, P, S
 */
export function parseRedIQFile(buffer: Buffer): RedIQFloorPlanData[] {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    
    // Find "Floor Plan Summary" sheet
    const sheetName = workbook.SheetNames.find(name => 
      name.toLowerCase().includes('floor') && name.toLowerCase().includes('plan') && name.toLowerCase().includes('summary')
    );
    
    if (!sheetName) {
      throw new Error('Could not find "Floor Plan Summary" sheet in RedIQ file');
    }
    
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
    
    // Find header row (usually row with "Floor Plan")
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(15, jsonData.length); i++) {
      const row = jsonData[i] as any[];
      if (row[0] === 'Floor Plan' || (typeof row[0] === 'string' && row[0].toLowerCase() === 'floor plan')) {
        headerRowIndex = i;
        break;
      }
    }
    
    if (headerRowIndex === -1) {
      throw new Error('Could not find header row in RedIQ file');
    }
    
    const results: RedIQFloorPlanData[] = [];
    
    // Process data rows (skip header)
    for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      
      // Skip empty rows
      if (!row || !row[0]) continue;
      
      const floorPlan = row[0] ? String(row[0]).trim() : '';
      
      // Skip if floor plan is empty or looks like a total/summary row
      if (!floorPlan || floorPlan.toLowerCase().includes('total') || floorPlan.toLowerCase().includes('average')) {
        continue;
      }
      
      // Columns: A=0, D=3, E=4, F=5, G=6, P=15, S=18
      results.push({
        floorPlan,
        bed: parseNumber(row[3]),
        bath: parseNumber(row[4]),
        netSf: parseNumber(row[5]),
        units: parseNumber(row[6]),
        marketRent: parseNumber(row[15]),
        inPlaceRent: parseNumber(row[16]), // In-Place Rent is typically column Q (16)
        columnS: row[18] ? String(row[18]) : null, // Column S data
      });
    }
    
    return results;
  } catch (error) {
    throw new Error(`Failed to parse RedIQ file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Helper function to parse number from cell value
 */
function parseNumber(value: any): number | null {
  if (value === null || value === undefined || value === '') return null;
  
  // If already a number
  if (typeof value === 'number') {
    return isNaN(value) ? null : value;
  }
  
  // If string, try to parse
  if (typeof value === 'string') {
    // Remove currency symbols, commas, etc.
    const cleaned = value.replace(/[$,\s]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }
  
  return null;
}

/**
 * Validate AIQ file structure
 */
export function validateAIQFile(buffer: Buffer): { valid: boolean; error?: string } {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames.find(name => 
      name.toLowerCase().includes('floor') && name.toLowerCase().includes('plan') && name.toLowerCase().includes('data')
    );
    
    if (!sheetName) {
      return { valid: false, error: 'Missing "Floor Plan Data" sheet' };
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Invalid file format' };
  }
}

/**
 * Validate RedIQ file structure
 */
export function validateRedIQFile(buffer: Buffer): { valid: boolean; error?: string } {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames.find(name => 
      name.toLowerCase().includes('floor') && name.toLowerCase().includes('plan') && name.toLowerCase().includes('summary')
    );
    
    if (!sheetName) {
      return { valid: false, error: 'Missing "Floor Plan Summary" sheet' };
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Invalid file format' };
  }
}

