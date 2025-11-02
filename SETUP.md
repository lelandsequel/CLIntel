# C&L Intel Setup Guide

## Quick Start (Without Manus)

This app has been migrated from Manus and now runs independently. Here's how to set it up:

### 1. Prerequisites

- Node.js 20.x or higher
- MySQL database (see database options below)
- AWS S3 bucket (optional, for document uploads)

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Database Setup

The app requires a MySQL database. You have several options:

#### Option A: Free Cloud MySQL (Recommended for Testing)

**PlanetScale** (Free tier available):
1. Sign up at https://planetscale.com
2. Create a new database
3. Get your connection string
4. Add to `.env`: `DATABASE_URL=mysql://...`

**Railway** (Free $5 credit monthly):
1. Sign up at https://railway.app
2. Create a new MySQL database
3. Copy the connection string
4. Add to `.env`: `DATABASE_URL=mysql://...`

#### Option B: Local MySQL with Docker

```bash
# Start MySQL in Docker
docker run --name clintel-mysql \
  -e MYSQL_ROOT_PASSWORD=clintel123 \
  -e MYSQL_DATABASE=clintel \
  -p 3306:3306 \
  -d mysql:8

# Add to .env
DATABASE_URL=mysql://root:clintel123@localhost:3306/clintel
```

#### Option C: Local MySQL Installation

If you have MySQL installed locally:
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE clintel;"

# Add to .env
DATABASE_URL=mysql://root:yourpassword@localhost:3306/clintel
```

### 4. Configure Environment Variables

Edit the `.env` file in the root directory:

```env
# Required
DATABASE_URL=mysql://user:password@host:port/database
VITE_APP_TITLE=C&L Intel

# Optional (for document uploads)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket

# Optional (OAuth - bypassed if not set)
OAUTH_SERVER_URL=
VITE_OAUTH_PORTAL_URL=
VITE_APP_ID=
```

### 5. Initialize Database

```bash
# Push database schema
pnpm db:push
```

### 6. Start Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

## Features Available Without Full Setup

- ✅ UI/UX - Full interface is accessible
- ✅ Authentication - Bypassed in development mode
- ❌ Property Management - Requires database
- ❌ Document Upload - Requires AWS S3
- ❌ Data Import - Requires database

## Deployment Notes

### Removed from Manus Version

- ❌ Manus branding badge (removed)
- ❌ `vite-plugin-manus-runtime` dependency (removed)
- ✅ Added OAuth bypass for development
- ✅ Made authentication optional when not configured

### Production Deployment

For production deployment:

1. Set up a production MySQL database
2. Configure AWS S3 for document storage
3. Set `JWT_SECRET` to a secure random string
4. Configure OAuth if needed
5. Build the app: `pnpm build`
6. Start production server: `pnpm start`

## Troubleshooting

### "Database not available" errors

- Make sure `DATABASE_URL` is set in `.env`
- Verify your database is running and accessible
- Check that you ran `pnpm db:push` to create tables

### Document upload fails

- Ensure AWS credentials are set in `.env`
- Verify S3 bucket exists and is accessible
- Check IAM permissions for upload/read

### OAuth errors

- OAuth is optional in development
- Set `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, and `VITE_APP_ID` to enable
- Or leave blank to bypass authentication entirely

## Database Schema

The app uses the following main tables:

- `users` - User accounts
- `propertySearches` - Search configurations
- `searchResults` - Property records
- `propertyDocuments` - Uploaded documents
- `dataImports` - Import history
- `floorPlans` - Floor plan data
- `marketReports` - Report groupings

Run `pnpm db:push` to create all tables automatically.

## Support

For issues or questions:
- Email: leland@candlstrategy.com
- GitHub: https://github.com/lelandsequel/CLIntel
