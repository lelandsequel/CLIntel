/**
 * Script to import foreclosure opportunities data into the database
 * Run with: pnpm tsx scripts/import-foreclosure-data.ts
 */

import { getDb } from '../server/db';
import { searchResults, propertySearches } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

// Helper function to get or create the manual entries search record
async function getManualEntriesSearchId(db: any): Promise<number> {
  const existing = await db.select().from(propertySearches).where(eq(propertySearches.name, 'Manual Entries')).limit(1);
  
  if (existing.length > 0) {
    return existing[0].id;
  }
  
  // Create it if it doesn't exist
  const [result] = await db.insert(propertySearches).values({
    name: 'Manual Entries',
    geographicArea: 'Various',
    status: 'completed',
    totalResults: 0,
  });
  
  return result.insertId;
}

const properties = [
  {
    propertyName: 'Adenine Apartments',
    address: '1755 Wyndale Street',
    city: 'Houston',
    state: 'TX',
    units: 265,
    price: 42000000,
    yearBuilt: 2016,
    debtAmount: 42000000,
    currentOwner: 'Madera Residential (Lubbock-based)',
    lender: 'Prime Finance Partners',
    foreclosureStatus: 'October 2025 auction',
    buyRationale: `Forced Sale/Distressed Pricing: Only 2 years after purchase, owner facing foreclosure indicates severe financial distress - likely available below replacement cost
Modern Asset (2016 Build): Newer construction means minimal deferred maintenance, lower capex requirements, and Class A/A- positioning
Strong Houston Submarket: Despite market distress, quality newer assets will recover first when market stabilizes`,
    propertyType: 'acquisition' as const,
    opportunityType: 'distressed_sale' as const,
    urgencyLevel: 'immediate' as const,
  },
  {
    propertyName: 'Barcelo Apartments',
    address: '3501 Pin Oak Drive',
    city: 'San Antonio',
    state: 'TX',
    units: 288,
    price: 30500000,
    yearBuilt: 1972,
    debtAmount: 30500000,
    currentOwner: 'GVA (Alan Stalcup - troubled investor)',
    lender: 'CBRE Multifamily',
    foreclosureStatus: 'October 2025 auction',
    buyRationale: `Extremely Low Basis ($106K/unit): Well below replacement cost and market comps - significant upside potential
Troubled Owner = Motivated Deal: Alan Stalcup identified as "troubled investor" - likely multiple distressed assets, potential for portfolio acquisition
Value-Add Vintage (1972): 53-year-old property likely has significant renovation upside to reposition to Class B+/A-`,
    propertyType: 'acquisition' as const,
    opportunityType: 'distressed_sale' as const,
    urgencyLevel: 'immediate' as const,
  },
  {
    propertyName: 'Parea Oak Lawn',
    address: '4503 Lake Avenue',
    city: 'Dallas',
    state: 'TX',
    units: 131,
    price: 25500000,
    yearBuilt: 1970,
    debtAmount: 25500000,
    currentOwner: 'Sun Equity Partners (Lakewood, NJ)',
    lender: 'Arbor Realty (foreclosing)',
    foreclosureStatus: 'October 2025 auction',
    buyRationale: `Prime Dallas Location (Oak Lawn): Oak Lawn is one of Dallas' most desirable urban neighborhoods - strong long-term demand
Out-of-State Owner Failure: New Jersey-based owner unable to manage Texas asset - indicates operational issues that local operator can fix
Arbor Realty Foreclosure: Major lender foreclosing suggests loan workout failed - bank likely motivated to sell REO quickly`,
    propertyType: 'acquisition' as const,
    opportunityType: 'distressed_sale' as const,
    urgencyLevel: 'immediate' as const,
  },
  {
    propertyName: 'Arioso Apartments & Townhomes',
    address: '3030 Claremont Drive',
    city: 'Grand Prairie',
    state: 'TX',
    units: 288,
    price: 56000000,
    yearBuilt: 2007,
    debtAmount: 56000000,
    currentOwner: 'IMH Companies (Ed Monce)',
    lender: 'Rialto Real Estate fund',
    foreclosureStatus: 'October 2025 auction',
    buyRationale: `Recent Vintage (2007): Modern construction with lower capex needs, likely Class A- positioning
Quick Failure (Bought 2022): Only 3 years of ownership before foreclosure indicates overleveraged acquisition - opportunity to acquire at basis below 2022 price
Institutional Lender (Rialto): Real estate fund lender likely sophisticated and motivated to clear non-performing asset quickly`,
    propertyType: 'acquisition' as const,
    opportunityType: 'distressed_sale' as const,
    urgencyLevel: 'immediate' as const,
  },
  {
    propertyName: 'Falls of Braeburn',
    address: '9707 Braeburn Glen',
    city: 'Houston',
    state: 'TX',
    units: 191,
    price: 64500000,
    debtAmount: 64500000,
    currentOwner: 'Rao Polavarapu\'s Falls Apartment Group',
    foreclosureStatus: 'Multiple foreclosure notices',
    buyRationale: `Extreme Distress: Multiple foreclosure notices without sale indicates lender/borrower negotiation breakdown - ultimate forced sale likely at steep discount
Portfolio Opportunity: 6 properties totaling 2,213 units - potential to acquire entire portfolio and achieve scale instantly
CMBS Special Servicing (August 2025): Loan transferred to special servicer - indicates serious default, special servicer motivated to resolve`,
    propertyType: 'acquisition' as const,
    opportunityType: 'distressed_sale' as const,
    urgencyLevel: 'immediate' as const,
    notes: 'Part of Falls Apartment Group Portfolio (6 properties, 2,213 units total)',
  },
  {
    propertyName: 'The Selena Apartments',
    address: '250 Uvalde Road',
    city: 'Houston',
    state: 'TX',
    units: 446,
    price: 37900000,
    debtAmount: 37900000,
    currentOwner: 'Rao Polavarapu\'s Falls Apartment Group',
    foreclosureStatus: 'Multiple foreclosure notices',
    buyRationale: `Largest Unit Count in Portfolio (446 units): Scale asset with strong operational leverage
Low Implied Basis ($85K/unit): Significantly below market - huge value-add potential
Part of Distressed Portfolio: Opportunity to negotiate bulk discount on multiple assets`,
    propertyType: 'acquisition' as const,
    opportunityType: 'distressed_sale' as const,
    urgencyLevel: 'immediate' as const,
    notes: 'Part of Falls Apartment Group Portfolio (6 properties, 2,213 units total)',
  },
  {
    propertyName: 'Falls of Las Villas',
    address: '407 Richey Street',
    city: 'Houston',
    state: 'TX',
    units: 466,
    debtAmount: 33500000,
    currentOwner: 'Rao Polavarapu\'s Falls Apartment Group',
    foreclosureStatus: 'Multiple foreclosure notices',
    buyRationale: `Adjacent Properties (Same Street): 980 units on same street = operational synergies, single management team
Combined Debt Only $33.5M: Implies ~$34,000/unit basis - extreme value opportunity
Bulk Acquisition Leverage: Two properties, one negotiation with lender`,
    propertyType: 'acquisition' as const,
    opportunityType: 'distressed_sale' as const,
    urgencyLevel: 'immediate' as const,
    notes: 'Part of Falls Apartment Group Portfolio. Combined with Falls of Alta Vista (980 units total, $33.5M debt)',
  },
  {
    propertyName: 'Falls of Alta Vista',
    address: '621 Richey Street',
    city: 'Houston',
    state: 'TX',
    units: 514,
    debtAmount: 33500000,
    currentOwner: 'Rao Polavarapu\'s Falls Apartment Group',
    foreclosureStatus: 'Multiple foreclosure notices',
    buyRationale: `Adjacent Properties (Same Street): 980 units on same street = operational synergies, single management team
Combined Debt Only $33.5M: Implies ~$34,000/unit basis - extreme value opportunity
Bulk Acquisition Leverage: Two properties, one negotiation with lender`,
    propertyType: 'acquisition' as const,
    opportunityType: 'distressed_sale' as const,
    urgencyLevel: 'immediate' as const,
    notes: 'Part of Falls Apartment Group Portfolio. Combined with Falls of Las Villas (980 units total, $33.5M debt)',
  },
  {
    propertyName: 'Falls of Westpark',
    address: '6130 Southwest',
    city: 'Houston',
    state: 'TX',
    units: 356,
    price: 29000000,
    debtAmount: 29000000,
    currentOwner: 'Rao Polavarapu\'s Falls Apartment Group',
    foreclosureStatus: 'Multiple foreclosure notices',
    buyRationale: `Low Basis ($81K/unit): Well below replacement cost
Part of 6-Property Portfolio: Negotiate package deal
Southwest Houston Location: Established submarket with stable demand`,
    propertyType: 'acquisition' as const,
    opportunityType: 'distressed_sale' as const,
    urgencyLevel: 'immediate' as const,
    notes: 'Part of Falls Apartment Group Portfolio (6 properties, 2,213 units total)',
  },
  {
    propertyName: 'The Sophia Apartments',
    address: '11500 Green Plaza',
    city: 'Houston',
    state: 'TX',
    units: 240,
    price: 17900000,
    debtAmount: 17900000,
    currentOwner: 'Rao Polavarapu\'s Falls Apartment Group',
    foreclosureStatus: 'Multiple foreclosure notices',
    buyRationale: `Lowest Basis in Portfolio ($74K/unit): Maximum value-add opportunity
Smallest Property (240 units): Could be carved out of portfolio for smaller acquisition
Green Plaza Location: Established Houston neighborhood`,
    propertyType: 'acquisition' as const,
    opportunityType: 'distressed_sale' as const,
    urgencyLevel: 'immediate' as const,
    notes: 'Part of Falls Apartment Group Portfolio (6 properties, 2,213 units total)',
  },
  {
    propertyName: 'Aviator at Brooks',
    address: '8010 Aeromedical Road',
    city: 'San Antonio',
    state: 'TX',
    units: 280,
    price: 33900000,
    debtAmount: 33900000,
    foreclosureStatus: 'Second time at auction block',
    buyRationale: `Second Foreclosure Attempt: Failed to sell first time = lender increasingly motivated, likely to accept lower bid
Brooks Development Area: Former military base redevelopment - emerging submarket with growth potential
Moderate Basis ($121K/unit): Room for value-add while maintaining reasonable entry price`,
    propertyType: 'acquisition' as const,
    opportunityType: 'distressed_sale' as const,
    urgencyLevel: 'developing' as const,
    notes: 'REPEAT FORECLOSURE - Second time at auction',
  },
];

async function importData() {
  console.log('Starting import of foreclosure opportunities...');
  
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const searchId = await getManualEntriesSearchId(db);
  console.log(`Using search ID: ${searchId}`);

  let successCount = 0;
  let errorCount = 0;

  for (const property of properties) {
    try {
      const pricePerUnit = property.price && property.units 
        ? Math.round(property.price / property.units) 
        : undefined;
      
      const score = property.urgencyLevel === 'immediate' ? 80 : 
                    property.urgencyLevel === 'developing' ? 60 : 40;

      await db.insert(searchResults).values({
        searchId,
        propertyName: property.propertyName,
        address: property.address,
        city: property.city,
        state: property.state,
        units: property.units,
        price: property.price,
        pricePerUnit,
        yearBuilt: property.yearBuilt,
        debtAmount: property.debtAmount,
        currentOwner: property.currentOwner,
        lender: property.lender,
        foreclosureStatus: property.foreclosureStatus,
        buyRationale: property.buyRationale,
        propertyType: property.propertyType,
        opportunityType: property.opportunityType,
        urgencyLevel: property.urgencyLevel,
        score,
        dataSource: 'The Real Deal - October 2025 Foreclosure Report',
        notes: property.notes,
      });

      console.log(`✓ Imported: ${property.propertyName}`);
      successCount++;
    } catch (error) {
      console.error(`✗ Failed to import ${property.propertyName}:`, error);
      errorCount++;
    }
  }

  console.log(`\nImport complete!`);
  console.log(`Success: ${successCount} properties`);
  console.log(`Errors: ${errorCount} properties`);
  
  process.exit(0);
}

importData().catch(error => {
  console.error('Import failed:', error);
  process.exit(1);
});

