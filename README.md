# C&L Intel

**A product of C&L Strategy**

C&L Intel is a comprehensive property intelligence and data consolidation platform designed for multifamily real estate acquisition and management target identification. The platform enables teams to track foreclosure opportunities, distressed assets, and management takeover targets with detailed financial and operational data.

## Features

### 🏢 Property Management
- **Acquisition Targets Tracking**: Monitor properties identified for potential acquisition with detailed financial metrics
- **Management Targets**: Track properties ripe for management company replacement
- **Multifamily-Specific Fields**: Debt amount, current owner, lender, foreclosure status, and buy rationale
- **Urgency Classification**: Immediate, developing, and future opportunity categorization

### 📄 Data Import & Upload
- **Text File Converter**: Drag-and-drop .txt file parser that automatically extracts property data
- **Bulk Upload**: Import multiple properties at once from formatted text files
- **Manual Entry**: Add individual properties with comprehensive data fields
- **Smart Parsing**: Automatically extracts units, debt, owner, lender, foreclosure status, and investment thesis

### 📊 Property Intelligence
- **Detailed Property Pages**: Comprehensive view of each property with Overview, Documents, and Notes tabs
- **Financial Metrics**: Price, debt amount, price per unit, cap rate, opportunity score
- **Ownership Information**: Current owner, lender, acquisition date, foreclosure status
- **Buy Rationale**: Investment thesis with multiple supporting points
- **Document Management**: Upload and organize offering memos, financials, inspections, photos, contracts

### 🔍 Search & Filter
- **Property Type Filtering**: Separate views for Acquisitions and Management Targets
- **Urgency-Based Organization**: Sort by immediate, developing, or future opportunities
- **Data Source Tracking**: Track where each property lead originated

## Technology Stack

### Frontend
- **React** with TypeScript
- **Wouter** for routing
- **TailwindCSS** for styling
- **shadcn/ui** component library
- **Vite** for build tooling

### Backend
- **Node.js** with Express
- **tRPC** for type-safe API
- **Drizzle ORM** for database operations
- **MySQL** database

### Infrastructure
- **AWS S3** for document storage
- **JWT** authentication
- **OAuth** integration ready

## Getting Started

### Prerequisites
- Node.js 22.x or higher
- MySQL database
- AWS S3 bucket (for document storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/lelandsequel/CLIntel.git
   cd CLIntel
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Database
   DATABASE_URL=mysql://user:password@host:port/database
   
   # JWT Authentication
   JWT_SECRET=your-secret-key
   
   # OAuth (if using)
   OAUTH_SERVER_URL=your-oauth-server
   VITE_OAUTH_PORTAL_URL=your-oauth-portal
   
   # AWS S3 (for document storage)
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=your-bucket-name
   
   # App Configuration
   VITE_APP_TITLE=C&L Intel
   VITE_APP_LOGO=/logo.png
   
   # Authorized Users
   OWNER_NAME=Your Name
   OWNER_OPEN_ID=your-email@domain.com
   ```

4. **Initialize the database**
   ```bash
   pnpm db:push
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Access the application**
   
   Open your browser to `http://localhost:3000`

## Usage

### Importing Properties

#### Method 1: Text File Import
1. Navigate to **Acquisitions** or **Management Targets** page
2. Click **"Import Text File"** button
3. Drag and drop your .txt file or click to browse
4. Review the parsed properties in the preview
5. Click **"Upload Properties"** to import

#### Method 2: Manual Entry
1. Navigate to **Upload** page or click **"Add Properties"**
2. Click **"Add Property Manually"**
3. Fill in the property details:
   - Property Name, City, State (required)
   - Units, Year Built, Price
   - Debt Amount, Current Owner, Lender
   - Foreclosure Status, Buy Rationale
4. Click **"Add Property"**

### Managing Properties

#### View Property Details
- Click on any property card to view full details
- Access **Overview**, **Documents**, and **Notes** tabs
- View financial metrics, ownership info, and buy rationale

#### Upload Documents
1. Open a property detail page
2. Click the **Documents** tab
3. Select document type (Offering Memo, Financials, Inspection, Photos, Contract, Other)
4. Drag and drop files or click to browse
5. Add optional description
6. Click **"Upload Document"**

### Text File Format

The text file parser supports the following format:

```
Property Name - City (Address)
Units: 265 units (2016)
Debt: $42 M mortgage via Prime Finance Partners
Foreclosure Status: October 2025 auction
Current Owner: Madera Residential

Buy Rationale:
- Forced Sale/Distressed Pricing
- Modern Asset (2016 Build)
- Strong Houston Submarket
```

## Project Structure

```
CLIntel/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and helpers
│   │   └── index.tsx      # App entry point
│   └── index.html
├── server/                # Backend Node.js application
│   ├── routers/          # tRPC routers
│   ├── db/               # Database configuration
│   └── index.ts          # Server entry point
├── drizzle/              # Database schema and migrations
│   └── schema.ts
└── scripts/              # Utility scripts
```

## Database Schema

### Main Tables
- **propertySearches**: Search configurations and history
- **searchResults**: Property records with acquisition data
- **propertyDocuments**: Document metadata and S3 references

### Key Fields
- Property details: name, address, city, state, units, year built
- Financial data: price, debt amount, price per unit, cap rate
- Ownership: current owner, lender, acquisition date
- Status: foreclosure status, urgency level, opportunity type
- Analysis: buy rationale, opportunity score, notes

## Development

### Available Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm preview          # Preview production build

# Database
pnpm db:push          # Push schema changes to database
pnpm db:studio        # Open Drizzle Studio (database GUI)

# Code Quality
pnpm lint             # Run ESLint
pnpm type-check       # Run TypeScript compiler check
```

### Adding New Features

1. Update database schema in `drizzle/schema.ts`
2. Run `pnpm db:push` to apply changes
3. Create/update tRPC routers in `server/routers/`
4. Build UI components in `client/src/components/`
5. Create/update pages in `client/src/pages/`

## Deployment

### Production Build

```bash
pnpm build
```

The built files will be in the `dist/` directory.

### Environment Variables

Ensure all production environment variables are set:
- Database connection string
- AWS credentials for S3
- JWT secret for authentication
- OAuth configuration (if applicable)

### Database Migration

Before deploying, ensure database schema is up to date:

```bash
pnpm db:push
```

## Security

- **Authentication**: JWT-based authentication with OAuth support
- **Authorization**: Email-based access control
- **Data Storage**: Sensitive documents stored in private S3 bucket
- **Environment Variables**: Never commit `.env` files to version control

## Support

For questions or issues:
- Email: leland@candlstrategy.com
- Repository: https://github.com/lelandsequel/CLIntel

## License

Proprietary - C&L Strategy

---

**Built with ❤️ by C&L Strategy**

