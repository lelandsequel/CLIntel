# Acquisition Tracking Fields Specification

## Overview
Comprehensive data fields for tracking multifamily property acquisitions from initial identification through closing.

---

## Core Property Information
*(Already exists in current schema)*

- **Property Name** - Property identifier
- **Address, City, State, Zip** - Location details
- **Units** - Number of units
- **Property Class** - B-, B, B+, A-, A, A+
- **Year Built** - Construction year
- **Square Footage** - Total rentable square footage

---

## Pricing & Valuation

### Purchase Price
- **List Price** - Initial asking price
- **Offered Price** - Price offered by buyer
- **Accepted Price** - Final agreed purchase price
- **Price Per Unit** - Calculated: Accepted Price / Units
- **Price Per SF** - Calculated: Accepted Price / Square Footage

### Valuation Metrics
- **Appraised Value** - Third-party appraisal value
- **Cap Rate** - Capitalization rate
- **NOI** (Net Operating Income) - Annual net operating income
- **Pro Forma NOI** - Projected NOI after improvements

---

## Deal Timeline

### Key Dates
- **Identified Date** - When property was first identified
- **LOI Submitted Date** - Letter of Intent submission
- **LOI Accepted Date** - LOI acceptance
- **Contract Date** - Purchase agreement execution
- **Due Diligence Start** - Start of due diligence period
- **Due Diligence End** - End of due diligence period
- **Expected Closing Date** - Projected closing date
- **Actual Closing Date** - Actual closing date
- **Days to Close** - Calculated: Contract Date to Closing Date

---

## Acquisition Status

### Deal Stage
- **Pipeline** - Initial identification, pre-LOI
- **LOI Submitted** - Letter of Intent submitted
- **Under Contract** - Purchase agreement executed
- **Due Diligence** - In due diligence period
- **Financing Approved** - Loan approved
- **Clear to Close** - All conditions met
- **Closed** - Deal completed
- **Lost** - Deal fell through
- **Passed** - Decided not to pursue

### Status Details
- **Current Status** - Current deal stage (enum)
- **Status Updated Date** - Last status change date
- **Status Notes** - Notes about current status

---

## Financing

### Loan Details
- **Financing Type** - Conventional, Agency, Bridge, Cash, etc.
- **Lender Name** - Financial institution
- **Loan Amount** - Total loan amount
- **Loan-to-Value (LTV)** - Percentage (calculated)
- **Interest Rate** - Annual interest rate
- **Loan Term** - Years
- **Amortization Period** - Years
- **Prepayment Penalty** - Yes/No and terms

### Equity & Down Payment
- **Equity Required** - Total equity investment needed
- **Down Payment** - Initial down payment amount
- **Down Payment %** - Percentage of purchase price
- **Earnest Money Deposit** - EMD amount
- **EMD Date** - When EMD was deposited
- **Additional Deposits** - Any additional deposits required

### Funding Status
- **Funding Status** - Pending, Pre-Approved, Approved, Funded, Declined
- **Funding Notes** - Details about financing status
- **Commitment Letter Date** - Loan commitment received date

---

## Due Diligence

### Inspection & Reports
- **Property Inspection Date** - Physical inspection date
- **Environmental Report** - Phase I/II status
- **Roof Inspection** - Roof condition report
- **HVAC Inspection** - HVAC systems report
- **Structural Inspection** - Structural engineer report
- **Capital Needs Assessment** - Deferred maintenance estimate

### Financial Review
- **Rent Roll Reviewed** - Yes/No
- **Operating Statements Reviewed** - Years reviewed (e.g., "2022-2024")
- **Tax Returns Reviewed** - Yes/No
- **Lease Audit Complete** - Yes/No
- **T-12 Verified** - Trailing 12 months verified

### Legal & Title
- **Title Report Received** - Date
- **Survey Received** - Date
- **Zoning Verified** - Yes/No
- **Permits Verified** - Yes/No
- **HOA Documents Reviewed** - If applicable

---

## Key Contacts

### Seller Side
- **Seller Name** - Property owner name
- **Seller Contact** - Phone/email
- **Seller Broker** - Listing broker name
- **Seller Broker Contact** - Phone/email

### Buyer Side
- **Acquisition Manager** - Internal point person
- **Buyer Broker** - Buyer's broker (if any)
- **Attorney** - Legal counsel
- **Lender Contact** - Loan officer name and contact

### Service Providers
- **Property Inspector** - Inspector name/company
- **Appraiser** - Appraiser name/company
- **Title Company** - Title company name
- **Insurance Agent** - Insurance contact

---

## Investment Analysis

### Returns
- **Year 1 Cash-on-Cash Return** - Projected %
- **IRR** (Internal Rate of Return) - Projected %
- **Equity Multiple** - Projected multiple
- **Hold Period** - Expected years to hold

### Operating Assumptions
- **Current Occupancy** - Current occupancy %
- **Stabilized Occupancy** - Target occupancy %
- **Current Avg Rent** - Current average rent per unit
- **Market Rent** - Market average rent per unit
- **Rent Growth Assumption** - Annual % increase
- **Expense Ratio** - Operating expenses as % of revenue

### Value-Add Strategy
- **Renovation Budget** - Total capex budget
- **Renovation Timeline** - Months
- **Expected Rent Increase** - $ per unit after renovation
- **Expected Value Increase** - $ or % increase in property value

---

## Risk Factors

### Property Risks
- **Deferred Maintenance** - Estimated $ amount
- **Environmental Issues** - Description
- **Zoning Risks** - Any zoning concerns
- **Market Risk** - Market condition concerns
- **Competition** - Competitive properties nearby

### Deal Risks
- **Financing Risk** - Concerns about loan approval
- **Appraisal Risk** - Risk of low appraisal
- **Seller Risk** - Concerns about seller performance
- **Timeline Risk** - Concerns about meeting deadlines

---

## Notes & Documentation

### Deal Notes
- **Initial Assessment Notes** - First impressions
- **Underwriting Notes** - Key assumptions and findings
- **Due Diligence Notes** - Issues discovered
- **Negotiation Notes** - Key negotiation points
- **Closing Notes** - Final deal details

### Document Links
- **LOI Document URL** - Link to LOI
- **Purchase Agreement URL** - Link to contract
- **Inspection Reports URL** - Link to reports folder
- **Closing Documents URL** - Link to closing docs
- **Property Photos URL** - Link to photos

---

## Calculated Fields

These fields are automatically calculated:

- **Price Per Unit** = Accepted Price / Units
- **Price Per SF** = Accepted Price / Square Footage
- **LTV** = Loan Amount / Accepted Price
- **Down Payment %** = Down Payment / Accepted Price
- **Days in Pipeline** = Today - Identified Date
- **Days to Close** = Actual Closing Date - Contract Date
- **Equity Required** = Accepted Price - Loan Amount

---

## Field Priority Levels

### Phase 1 (Essential)
- Purchase Price (List, Offered, Accepted)
- Closing Date (Expected, Actual)
- Funding Status
- Acquisition Status
- Key Dates (LOI, Contract, Due Diligence)
- Financing Details (Lender, Loan Amount, Rate)
- Key Contacts (Seller, Broker, Lender)

### Phase 2 (Important)
- Earnest Money Deposit
- Due Diligence Checklist
- Investment Returns (Cash-on-Cash, IRR)
- Operating Assumptions
- Renovation Budget
- Risk Factors

### Phase 3 (Nice to Have)
- Detailed Service Provider Contacts
- Document Links
- Detailed Inspection Results
- Value-Add Strategy Details

---

## Database Schema Recommendations

### New Table: `acquisitionDetails`
```sql
CREATE TABLE acquisitionDetails (
  id INT PRIMARY KEY AUTO_INCREMENT,
  propertyId INT NOT NULL, -- FK to searchResults
  
  -- Pricing
  listPrice DECIMAL(12,2),
  offeredPrice DECIMAL(12,2),
  acceptedPrice DECIMAL(12,2),
  appraisedValue DECIMAL(12,2),
  
  -- Timeline
  identifiedDate DATE,
  loiSubmittedDate DATE,
  loiAcceptedDate DATE,
  contractDate DATE,
  dueDiligenceStart DATE,
  dueDiligenceEnd DATE,
  expectedClosingDate DATE,
  actualClosingDate DATE,
  
  -- Status
  acquisitionStatus ENUM('pipeline', 'loi_submitted', 'under_contract', 'due_diligence', 'financing_approved', 'clear_to_close', 'closed', 'lost', 'passed'),
  statusUpdatedDate DATE,
  statusNotes TEXT,
  
  -- Financing
  financingType VARCHAR(50),
  lenderName VARCHAR(200),
  loanAmount DECIMAL(12,2),
  interestRate DECIMAL(5,3),
  loanTerm INT,
  downPayment DECIMAL(12,2),
  earnestMoneyDeposit DECIMAL(12,2),
  emdDate DATE,
  fundingStatus ENUM('pending', 'pre_approved', 'approved', 'funded', 'declined'),
  commitmentLetterDate DATE,
  
  -- Contacts
  sellerName VARCHAR(200),
  sellerContact VARCHAR(200),
  sellerBroker VARCHAR(200),
  buyerBroker VARCHAR(200),
  attorney VARCHAR(200),
  lenderContact VARCHAR(200),
  
  -- Investment Analysis
  year1CashOnCash DECIMAL(5,2),
  projectedIRR DECIMAL(5,2),
  equityMultiple DECIMAL(5,2),
  holdPeriod INT,
  renovationBudget DECIMAL(12,2),
  
  -- Notes
  dealNotes TEXT,
  dueDiligenceNotes TEXT,
  riskFactors TEXT,
  
  -- Documents
  loiDocumentUrl VARCHAR(500),
  contractDocumentUrl VARCHAR(500),
  inspectionReportsUrl VARCHAR(500),
  
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (propertyId) REFERENCES searchResults(id) ON DELETE CASCADE
);
```

---

## UI/UX Considerations

### Acquisition Detail Page
- **Overview Tab** - Key metrics and status
- **Timeline Tab** - Visual timeline of key dates
- **Financing Tab** - All financing details
- **Due Diligence Tab** - Checklist and findings
- **Contacts Tab** - All key contacts
- **Documents Tab** - Links to all documents
- **Notes Tab** - Deal notes and updates

### Status Dashboard
- Visual pipeline view (Kanban-style)
- Properties grouped by acquisition status
- Drag-and-drop to update status
- Color-coded by urgency/timeline

### Reporting
- Deals in pipeline report
- Closed deals report
- Lost deals analysis
- Average days to close
- Financing success rate

---

## Implementation Notes

1. Start with Phase 1 fields for MVP
2. Create separate `acquisitionDetails` table linked to properties
3. Only show acquisition fields for properties with `propertyType = 'acquisition'`
4. Add form validation for required fields based on status
5. Implement status change workflow with required field checks
6. Add timeline visualization for key dates
7. Create acquisition pipeline dashboard view

