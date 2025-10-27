# Real Estate Data Consolidation Tool - User Guide

## Overview

The Real Estate Data Consolidation Tool automates the process of consolidating ApartmentIQ and RedIQ market survey data into client-ready reports. This tool eliminates manual data entry, reduces errors, and saves hours of work.

## Key Features

### 🚀 Smart Data Ingestion
- **Drag-and-drop file upload** for both AIQ and RedIQ Excel files
- **Automatic validation** ensures correct file format and structure
- **Real-time processing** with progress tracking
- **Import history** shows all past uploads with status

### 📊 Consolidated Reports
- **Unified data view** combining AIQ competitor data with RedIQ subject data
- **Subject property highlighting** with visual distinction (blue background)
- **Sortable columns** - click any column header to sort
- **Calculated metrics** including Rent PSF automatically computed
- **Data source indicators** showing whether data comes from AIQ or RedIQ

### 📤 Client-Ready Exports
- **Excel export** with professional formatting and summary tables
- **Multiple sheets** including main data and subject property summary
- **Automatic calculations** for totals and averages
- **Download-ready files** named with current date

## How to Use

### Step 1: Upload Your Data Files

1. Navigate to the **Upload** page
2. Upload your files in this order:
   - **ApartmentIQ File**: Contains competitor property data
     - Must have "Floor Plan Data" tab
     - Columns A-F, N-O will be extracted
   - **RedIQ File**: Contains subject property data
     - Must have "Floor Plan Summary" tab
     - Columns A, D-G, P, S will be extracted
     - Enter the subject property name (e.g., "AVEN Apartments")

3. The system will:
   - Validate file structure
   - Parse the data
   - Store it in the database
   - Show success message with record count

### Step 2: View the Consolidated Report

1. Navigate to the **Report** page
2. You'll see a table with all data combined:
   - **Subject property rows** are highlighted in blue
   - **Competitor property rows** appear in standard format
   - All columns are sortable by clicking the header

### Step 3: Export for Clients

1. On the Report page, click **Export Excel**
2. The system generates:
   - **Market Survey sheet**: All consolidated data
   - **Summary sheet**: Subject property rollup with:
     - Floor plan breakdown
     - Total units
     - Average rent PSF
     - Other key metrics

3. The file downloads automatically with a timestamped name

## Data Logic

### Subject vs Competitor Data

The tool follows this logic:

- **For Subject Property**: Always use RedIQ data (more accurate, actual property data)
- **For Competitor Properties**: Use ApartmentIQ data (web-scraped advertised rates)

This means:
- RedIQ data replaces AIQ data for the subject property only
- The subject property appears with both:
  - **Market Rent**: From RedIQ (advertised rates)
  - **AMC Rent**: From RedIQ (in-place/actual rents)
- Competitor properties show only AIQ data

### Column Mapping

| Output Column | AIQ Source | RedIQ Source |
|--------------|------------|--------------|
| Property | Column A | Subject name (user input) |
| Floor Plan | Column B | Column A |
| Bed | Column C | Column D |
| Bath | Column D | Column E |
| Sq Ft | Column E | Column F |
| Units | Column F | Column G |
| Market Rent | Column O | Column P |
| AMC Rent | - | Column Q (In-Place Rent) |
| Last 5 Leases | - | Column S |
| Rent PSF | Calculated | Calculated |

### Calculated Fields

- **Rent PSF** = Market Rent ÷ Square Feet
- Automatically computed for all floor plans

## File Requirements

### ApartmentIQ File Format

- **File type**: Excel (.xlsx or .xls)
- **Required sheet**: "Floor Plan Data" (or similar name containing "floor", "plan", "data")
- **Required columns**:
  - A: Property name
  - B: Floor plan name
  - C: Bedroom count
  - D: Bathroom count
  - E: Square footage
  - F: Total units
  - N: Available units
  - O: Available asking rent

### RedIQ File Format

- **File type**: Excel (.xlsx or .xls)
- **Required sheet**: "Floor Plan Summary" (or similar name containing "floor", "plan", "summary")
- **Required columns**:
  - A: Floor plan name
  - D: Bedroom count
  - E: Bathroom count
  - F: Net square footage
  - G: Number of units
  - P: Market rent
  - Q: In-place rent (used as AMC Rent)
  - S: Last 5 leases or other data

## Troubleshooting

### Upload Fails

**Problem**: File upload shows error message

**Solutions**:
- Verify the file is in Excel format (.xlsx or .xls)
- Check that the required sheet exists with correct name
- Ensure the file isn't corrupted
- Try re-downloading the file from the source system

### Missing Data in Report

**Problem**: Some properties or floor plans don't appear

**Solutions**:
- Check that the data exists in the source file
- Verify the property name matches exactly (case-sensitive)
- Look at the Import History to see if there were failed records
- Re-upload the file if needed

### Subject Property Not Highlighted

**Problem**: Subject property appears like other properties

**Solutions**:
- Ensure you entered the correct subject property name when uploading RedIQ file
- Name must match exactly (including spaces and capitalization)
- Re-upload the RedIQ file with the correct name

### Export Doesn't Include All Data

**Problem**: Excel export is missing some records

**Solutions**:
- Refresh the Report page to ensure latest data is loaded
- Check that all uploads completed successfully
- Verify no filters are applied (future feature)

## Tips for Best Results

1. **Upload RedIQ first**: This creates the subject property in the system
2. **Use consistent naming**: Ensure property names match exactly across systems
3. **Check import history**: Always verify successful import before proceeding
4. **Review before exporting**: Check the Report page to ensure data looks correct
5. **Keep source files**: Save original AIQ and RedIQ files for reference

## Data Storage

- All uploaded data is stored securely in the database
- You can re-upload files to update data
- Import history tracks all uploads with timestamps
- Previous data is not automatically deleted (allows historical tracking)

## Future Enhancements

Planned features for future releases:

- **PDF Export**: Generate PDF reports with custom formatting
- **CoStar Integration**: Add CoStar data alongside AIQ
- **Manual Entry**: Edit Broker Rent and AMC Rent columns directly in the UI
- **Filters**: Filter report by property, floor plan, or other criteria
- **Custom Reports**: Save report configurations for reuse
- **Batch Operations**: Upload multiple files at once
- **Data Comparison**: Compare current vs historical data

## Support

For questions or issues:

1. Check this user guide first
2. Review the Import History for error messages
3. Verify file format matches requirements
4. Contact your system administrator

## Technical Details

### Technology Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Backend**: Express + tRPC + Node.js
- **Database**: MySQL/TiDB with Drizzle ORM
- **Excel Processing**: XLSX library
- **File Handling**: Base64 encoding for secure transmission

### Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Modern browsers with ES2020+ support

### Performance

- Handles files up to 10MB
- Processes 500+ rows in under 5 seconds
- Real-time updates via tRPC
- Optimized database queries

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-27

