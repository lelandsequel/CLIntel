# Real Estate Data Consolidation Tool - TODO

## Phase 1: Database Schema & Setup
- [x] Design and implement database schema for properties, floor plans, and imports
- [x] Create database migrations
- [x] Set up data models with Drizzle ORM

## Phase 2: File Upload & Excel Parsing
- [x] Create file upload UI component with drag-and-drop
- [x] Implement AIQ Excel parser (Floor Plan Data tab, columns A-F, N-O)
- [x] Implement RedIQ Excel parser (Floor Plan Summary tab, columns A, D-G, P, S)
- [x] Add file validation and error handling
- [x] Store parsed data in database
- [x] Create subject property selection interface

## Phase 3: Consolidated Report View
- [x] Build main report table component with TanStack Table
- [x] Implement data consolidation logic (AIQ comps + RedIQ subject)
- [x] Add subject property highlighting (AIQ advertised vs RedIQ AMC)
- [x] Implement column sorting functionality
- [x] Add manual entry columns (Broker Rent, AMC Rent)
- [x] Create auto-generated summary table by floor plan
- [x] Display RedIQ leasing data section
- [x] Calculate rent PSF and other derived metrics

## Phase 4: Export Functionality
- [x] Implement Excel export with formatting
- [ ] Implement PDF export with clean layout
- [x] Preserve visual highlighting in exports
- [x] Add export options (column selection, filters)

## Phase 5: Testing & Refinement
- [x] Test with actual AIQ and RedIQ sample files
- [x] Verify data accuracy and consolidation logic
- [x] Refine UI/UX based on output format
- [x] Add error handling and edge cases
- [x] Performance optimization

## Phase 6: Documentation & Deployment
- [x] Create user documentation
- [x] Add inline help and tooltips
- [x] Save checkpoint for deployment
- [x] Prepare deployment guide



## Phase 7: Multi-Report Management (NEW REQUIREMENT)
- [x] Create "Report/Project" entity to group AIQ + RedIQ uploads
- [x] Add "New Report" workflow to create isolated report sessions
- [x] Modify upload page to work within active report context
- [x] Create report list/management page showing all saved reports
- [x] Add ability to view/switch between different reports
- [x] Update consolidated view to show data for selected report only
- [x] Add report metadata (name, date, subject property, status)
- [x] Implement report deletion/archiving
- [x] Update export to work per-report basis
- [x] Add "Clear Data" or "Start New Report" functionality

