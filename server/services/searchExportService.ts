import ExcelJS from 'exceljs';

/**
 * Search Export Service
 * Generates formatted Excel reports for property search results
 */

export interface SearchExportData {
  searchName: string;
  geographicArea: string;
  propertyClass: string;
  minUnits: number;
  searchDate: Date;
  results: {
    immediate: any[];
    developing: any[];
    future: any[];
  };
}

/**
 * Generate Excel report for property search results
 */
export async function generateSearchExcelReport(data: SearchExportData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  
  // Summary Sheet
  const summarySheet = workbook.addWorksheet('Search Summary');
  
  // Title
  summarySheet.mergeCells('A1:F1');
  summarySheet.getCell('A1').value = 'Property Search & Acquisition Intelligence Report';
  summarySheet.getCell('A1').font = { size: 16, bold: true };
  summarySheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  
  // Search Details
  summarySheet.getCell('A3').value = 'Search Name:';
  summarySheet.getCell('B3').value = data.searchName;
  summarySheet.getCell('A4').value = 'Geographic Area:';
  summarySheet.getCell('B4').value = data.geographicArea;
  summarySheet.getCell('A5').value = 'Property Class:';
  summarySheet.getCell('B5').value = data.propertyClass;
  summarySheet.getCell('A6').value = 'Minimum Units:';
  summarySheet.getCell('B6').value = data.minUnits;
  summarySheet.getCell('A7').value = 'Search Date:';
  summarySheet.getCell('B7').value = data.searchDate.toLocaleDateString();
  
  // Make labels bold
  ['A3', 'A4', 'A5', 'A6', 'A7'].forEach(cell => {
    summarySheet.getCell(cell).font = { bold: true };
  });
  
  // Summary Statistics
  summarySheet.getCell('A9').value = 'Results Summary';
  summarySheet.getCell('A9').font = { size: 14, bold: true };
  
  summarySheet.getCell('A11').value = 'Category';
  summarySheet.getCell('B11').value = 'Count';
  summarySheet.getCell('C11').value = 'Description';
  
  summarySheet.getRow(11).font = { bold: true };
  summarySheet.getRow(11).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  
  summarySheet.getCell('A12').value = 'Immediate Opportunities';
  summarySheet.getCell('B12').value = data.results.immediate.length;
  summarySheet.getCell('C12').value = 'Act within 48 hours';
  summarySheet.getRow(12).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFC7CE' }
  };
  
  summarySheet.getCell('A13').value = 'Developing Opportunities';
  summarySheet.getCell('B13').value = data.results.developing.length;
  summarySheet.getCell('C13').value = 'Monitor closely, 1-2 weeks';
  summarySheet.getRow(13).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFEB9C' }
  };
  
  summarySheet.getCell('A14').value = 'Future Pipeline';
  summarySheet.getCell('B14').value = data.results.future.length;
  summarySheet.getCell('C14').value = 'Track for 30-60 days';
  summarySheet.getRow(14).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFC6EFCE' }
  };
  
  summarySheet.getCell('A15').value = 'Total Results';
  summarySheet.getCell('B15').value = data.results.immediate.length + data.results.developing.length + data.results.future.length;
  summarySheet.getRow(15).font = { bold: true };
  
  // Set column widths
  summarySheet.getColumn('A').width = 25;
  summarySheet.getColumn('B').width = 15;
  summarySheet.getColumn('C').width = 40;
  
  // Immediate Opportunities Sheet
  if (data.results.immediate.length > 0) {
    createResultsSheet(workbook, 'Immediate Opportunities', data.results.immediate, 'FFFFC7CE');
  }
  
  // Developing Opportunities Sheet
  if (data.results.developing.length > 0) {
    createResultsSheet(workbook, 'Developing Opportunities', data.results.developing, 'FFFFEB9C');
  }
  
  // Future Pipeline Sheet
  if (data.results.future.length > 0) {
    createResultsSheet(workbook, 'Future Pipeline', data.results.future, 'FFC6EFCE');
  }
  
  // All Results Sheet
  const allResults = [...data.results.immediate, ...data.results.developing, ...data.results.future];
  if (allResults.length > 0) {
    createResultsSheet(workbook, 'All Results', allResults, 'FFE0E0E0');
  }
  
  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Create a worksheet with property results
 */
function createResultsSheet(workbook: ExcelJS.Workbook, sheetName: string, results: any[], headerColor: string) {
  const sheet = workbook.addWorksheet(sheetName);
  
  // Define columns
  sheet.columns = [
    { header: 'Property Name', key: 'propertyName', width: 30 },
    { header: 'Address', key: 'address', width: 40 },
    { header: 'City', key: 'city', width: 20 },
    { header: 'State', key: 'state', width: 10 },
    { header: 'Units', key: 'units', width: 10 },
    { header: 'Class', key: 'propertyClass', width: 10 },
    { header: 'Price', key: 'price', width: 15 },
    { header: 'Price/Unit', key: 'pricePerUnit', width: 15 },
    { header: 'Occupancy', key: 'occupancyRate', width: 12 },
    { header: 'Cap Rate', key: 'capRate', width: 12 },
    { header: 'DOM', key: 'daysOnMarket', width: 10 },
    { header: 'Score', key: 'score', width: 10 },
    { header: 'Type', key: 'opportunityType', width: 20 },
    { header: 'Source', key: 'dataSource', width: 20 },
    { header: 'URL', key: 'sourceUrl', width: 50 },
  ];
  
  // Style header row
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  };
  sheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };
  
  // Add data rows
  results.forEach((result, index) => {
    const row = sheet.addRow({
      propertyName: result.propertyName,
      address: result.address || 'N/A',
      city: result.city,
      state: result.state,
      units: result.units || 'N/A',
      propertyClass: result.propertyClass || 'N/A',
      price: result.price ? `$${(result.price / 1000000).toFixed(2)}M` : 'N/A',
      pricePerUnit: result.pricePerUnit ? `$${(result.pricePerUnit / 1000).toFixed(0)}K` : 'N/A',
      occupancyRate: result.occupancyRate ? `${result.occupancyRate}%` : 'N/A',
      capRate: result.capRate ? `${result.capRate}%` : 'N/A',
      daysOnMarket: result.daysOnMarket !== null && result.daysOnMarket !== undefined ? result.daysOnMarket : 'N/A',
      score: result.score,
      opportunityType: formatOpportunityType(result.opportunityType),
      dataSource: result.dataSource,
      sourceUrl: result.sourceUrl || 'N/A',
    });
    
    // Alternate row colors
    if (index % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF5F5F5' }
      };
    }
    
    // Highlight high scores
    if (result.score >= 80) {
      sheet.getCell(`L${row.number}`).font = { bold: true, color: { argb: 'FF008000' } };
    }
  });
  
  // Add filters
  sheet.autoFilter = {
    from: 'A1',
    to: `O1`
  };
  
  // Freeze header row
  sheet.views = [
    { state: 'frozen', xSplit: 0, ySplit: 1 }
  ];
}

/**
 * Format opportunity type for display
 */
function formatOpportunityType(type: string): string {
  const types: Record<string, string> = {
    new_listing: 'New Listing',
    distressed_sale: 'Distressed Sale',
    new_construction: 'New Construction',
    underperforming: 'Underperforming',
    company_distress: 'Company Distress',
    off_market: 'Off-Market',
  };
  return types[type] || type;
}

/**
 * Generate market intelligence summary report
 */
export async function generateMarketIntelligenceReport(data: SearchExportData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Market Intelligence');
  
  // Title
  sheet.mergeCells('A1:E1');
  sheet.getCell('A1').value = 'Market Intelligence Summary';
  sheet.getCell('A1').font = { size: 16, bold: true };
  sheet.getCell('A1').alignment = { horizontal: 'center' };
  
  // Market Overview
  sheet.getCell('A3').value = 'Market Overview';
  sheet.getCell('A3').font = { size: 14, bold: true };
  
  const allResults = [...data.results.immediate, ...data.results.developing, ...data.results.future];
  
  // Calculate market metrics
  const avgPrice = allResults.filter(r => r.price).reduce((sum, r) => sum + r.price, 0) / allResults.filter(r => r.price).length;
  const avgPricePerUnit = allResults.filter(r => r.pricePerUnit).reduce((sum, r) => sum + r.pricePerUnit, 0) / allResults.filter(r => r.pricePerUnit).length;
  const avgCapRate = allResults.filter(r => r.capRate).reduce((sum, r) => sum + parseFloat(r.capRate), 0) / allResults.filter(r => r.capRate).length;
  const avgOccupancy = allResults.filter(r => r.occupancyRate).reduce((sum, r) => sum + parseFloat(r.occupancyRate), 0) / allResults.filter(r => r.occupancyRate).length;
  
  sheet.getCell('A5').value = 'Average Price:';
  sheet.getCell('B5').value = `$${(avgPrice / 1000000).toFixed(2)}M`;
  
  sheet.getCell('A6').value = 'Average Price/Unit:';
  sheet.getCell('B6').value = `$${(avgPricePerUnit / 1000).toFixed(0)}K`;
  
  sheet.getCell('A7').value = 'Average Cap Rate:';
  sheet.getCell('B7').value = `${avgCapRate.toFixed(2)}%`;
  
  sheet.getCell('A8').value = 'Average Occupancy:';
  sheet.getCell('B8').value = `${avgOccupancy.toFixed(2)}%`;
  
  // Opportunity Distribution
  sheet.getCell('A10').value = 'Opportunity Distribution';
  sheet.getCell('A10').font = { size: 14, bold: true };
  
  const typeDistribution = allResults.reduce((acc: Record<string, number>, r) => {
    acc[r.opportunityType] = (acc[r.opportunityType] || 0) + 1;
    return acc;
  }, {});
  
  let row = 12;
  Object.entries(typeDistribution).forEach(([type, count]) => {
    sheet.getCell(`A${row}`).value = formatOpportunityType(type);
    sheet.getCell(`B${row}`).value = count;
    row++;
  });
  
  // Set column widths
  sheet.getColumn('A').width = 25;
  sheet.getColumn('B').width = 20;
  
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

