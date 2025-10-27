import * as XLSX from 'xlsx';

export interface ConsolidatedRow {
  property: string;
  isSubject: boolean;
  floorPlan: string;
  bedrooms: string | null;
  bathrooms: string | null;
  squareFeet: number | null;
  numberOfUnits: number | null;
  marketRent: string | null;
  rentPsf: string | null;
  amcRent: string | null;
  brokerRent: string | null;
  rediqColumnS: string | null;
  dataSource: 'AIQ' | 'RedIQ';
}

/**
 * Generate Excel file from consolidated data
 */
export function generateExcelReport(data: ConsolidatedRow[], subjectPropertyName?: string): Buffer {
  // Create workbook
  const workbook = XLSX.utils.book_new();
  
  // Prepare data for main sheet
  const mainSheetData: any[][] = [
    // Header row
    [
      'Property',
      'Floor Plan',
      'Bed',
      'Bath',
      'Sq Ft',
      'Units',
      'Market Rent',
      'Rent PSF',
      'AMC Rent',
      'Broker Rent',
      'Last 5 Leases',
      'Source',
    ],
  ];
  
  // Add data rows
  data.forEach(row => {
    mainSheetData.push([
      row.property,
      row.floorPlan,
      row.bedrooms || '',
      row.bathrooms || '',
      row.squareFeet || '',
      row.numberOfUnits || '',
      row.marketRent ? parseFloat(row.marketRent) : '',
      row.rentPsf ? parseFloat(row.rentPsf) : '',
      row.amcRent ? parseFloat(row.amcRent) : '',
      row.brokerRent ? parseFloat(row.brokerRent) : '',
      row.rediqColumnS || '',
      row.dataSource,
    ]);
  });
  
  // Create worksheet
  const mainSheet = XLSX.utils.aoa_to_sheet(mainSheetData);
  
  // Set column widths
  mainSheet['!cols'] = [
    { wch: 25 }, // Property
    { wch: 15 }, // Floor Plan
    { wch: 8 },  // Bed
    { wch: 8 },  // Bath
    { wch: 10 }, // Sq Ft
    { wch: 8 },  // Units
    { wch: 12 }, // Market Rent
    { wch: 10 }, // Rent PSF
    { wch: 12 }, // AMC Rent
    { wch: 12 }, // Broker Rent
    { wch: 20 }, // Last 5 Leases
    { wch: 10 }, // Source
  ];
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, mainSheet, 'Market Survey');
  
  // Generate summary sheet if we have subject property data
  if (subjectPropertyName) {
    const subjectData = data.filter(row => row.isSubject);
    
    if (subjectData.length > 0) {
      const summaryData: any[][] = [
        ['Subject Property Summary'],
        ['Property:', subjectPropertyName],
        [],
        ['Floor Plan', 'Bed', 'Bath', 'Sq Ft', 'Units', 'Market Rent', 'Rent PSF', 'AMC Rent'],
      ];
      
      subjectData.forEach(row => {
        summaryData.push([
          row.floorPlan,
          row.bedrooms || '',
          row.bathrooms || '',
          row.squareFeet || '',
          row.numberOfUnits || '',
          row.marketRent ? parseFloat(row.marketRent) : '',
          row.rentPsf ? parseFloat(row.rentPsf) : '',
          row.amcRent ? parseFloat(row.amcRent) : '',
        ]);
      });
      
      // Calculate totals
      const totalUnits = subjectData.reduce((sum, row) => sum + (row.numberOfUnits || 0), 0);
      const avgRentPsf = subjectData.reduce((sum, row) => {
        const psf = row.rentPsf ? parseFloat(row.rentPsf) : 0;
        return sum + psf;
      }, 0) / subjectData.length;
      
      summaryData.push([]);
      summaryData.push(['Total Units:', totalUnits]);
      summaryData.push(['Average Rent PSF:', avgRentPsf.toFixed(2)]);
      
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      summarySheet['!cols'] = [
        { wch: 15 },
        { wch: 8 },
        { wch: 8 },
        { wch: 10 },
        { wch: 8 },
        { wch: 12 },
        { wch: 10 },
        { wch: 12 },
      ];
      
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    }
  }
  
  // Write to buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
}

/**
 * Generate CSV export (alternative format)
 */
export function generateCSVReport(data: ConsolidatedRow[]): string {
  const headers = [
    'Property',
    'Floor Plan',
    'Bed',
    'Bath',
    'Sq Ft',
    'Units',
    'Market Rent',
    'Rent PSF',
    'AMC Rent',
    'Broker Rent',
    'Last 5 Leases',
    'Source',
  ];
  
  const rows = data.map(row => [
    row.property,
    row.floorPlan,
    row.bedrooms || '',
    row.bathrooms || '',
    row.squareFeet || '',
    row.numberOfUnits || '',
    row.marketRent || '',
    row.rentPsf || '',
    row.amcRent || '',
    row.brokerRent || '',
    row.rediqColumnS || '',
    row.dataSource,
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');
  
  return csvContent;
}

