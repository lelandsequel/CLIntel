import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Upload, BarChart3, FileSpreadsheet, Search, 
  Building2, TrendingUp, CheckCircle2
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">C&L Property</h1>
                <p className="text-sm text-muted-foreground">Data Consolidation & Intelligence Platform</p>
              </div>
            </div>
            <nav className="flex gap-4">
              <Link href="/reports">
                <Button variant="ghost">Market Reports</Button>
              </Link>
              <Link href="/search">
                <Button variant="ghost">Property Search</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold tracking-tight mb-6">
            Internal Data Management System
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Consolidate market survey data from ApartmentIQ and RedIQ. 
            Search for acquisition opportunities. Generate client-ready reports.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/reports">
              <Button size="lg" className="gap-2">
                <Upload className="h-5 w-5" />
                Create Market Report
              </Button>
            </Link>
            <Link href="/search">
              <Button size="lg" variant="outline" className="gap-2">
                <Search className="h-5 w-5" />
                Property Search
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Market Survey Consolidation */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Market Survey Data</CardTitle>
              </div>
              <CardDescription>
                Upload and consolidate ApartmentIQ and RedIQ Excel files into unified reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Automatic data parsing and validation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Subject property highlighting (RedIQ AMC vs AIQ advertised)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Sortable tables with manual entry columns</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Auto-generated summary tables by floor plan</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Property Search */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Acquisition Intelligence</CardTitle>
              </div>
              <CardDescription>
                AI-powered property search to identify multifamily acquisition opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Search by geographic area and property criteria</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Three-tier urgency classification (Immediate/Developing/Future)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>AI-powered property valuation and investment analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Recurring search scheduling and automated alerts</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Consolidated Reports */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Consolidated Reporting</CardTitle>
              </div>
              <CardDescription>
                View, analyze, and manage all data in interactive tables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Sort by any column (property, units, rent, PSF, etc.)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Clear visual indicators for data sources</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Multiple reports per property/market</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Import history and version tracking</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Export Capabilities */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileSpreadsheet className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Client-Ready Exports</CardTitle>
              </div>
              <CardDescription>
                Export formatted reports for client presentations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Excel export with professional formatting</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Preserved highlighting and visual indicators</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Summary tables and leasing data included</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Market intelligence reports with analytics</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="container mx-auto px-4 py-12 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Typical Workflow</h3>
          
          <div className="space-y-8">
            {/* Market Survey Workflow */}
            <div>
              <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Market Survey Reports
              </h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-card p-4 rounded-lg border">
                  <div className="text-2xl font-bold text-primary mb-2">1</div>
                  <h5 className="font-semibold mb-1">Upload Data</h5>
                  <p className="text-sm text-muted-foreground">
                    Create a new report and upload AIQ and RedIQ Excel files
                  </p>
                </div>
                <div className="bg-card p-4 rounded-lg border">
                  <div className="text-2xl font-bold text-primary mb-2">2</div>
                  <h5 className="font-semibold mb-1">Review & Edit</h5>
                  <p className="text-sm text-muted-foreground">
                    View consolidated data, add manual entries, verify accuracy
                  </p>
                </div>
                <div className="bg-card p-4 rounded-lg border">
                  <div className="text-2xl font-bold text-primary mb-2">3</div>
                  <h5 className="font-semibold mb-1">Export</h5>
                  <p className="text-sm text-muted-foreground">
                    Download formatted Excel for client delivery
                  </p>
                </div>
              </div>
            </div>

            {/* Property Search Workflow */}
            <div>
              <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Property Acquisition Search
              </h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-card p-4 rounded-lg border">
                  <div className="text-2xl font-bold text-primary mb-2">1</div>
                  <h5 className="font-semibold mb-1">Configure Search</h5>
                  <p className="text-sm text-muted-foreground">
                    Set geographic area, property class, units, and search depth
                  </p>
                </div>
                <div className="bg-card p-4 rounded-lg border">
                  <div className="text-2xl font-bold text-primary mb-2">2</div>
                  <h5 className="font-semibold mb-1">Review Results</h5>
                  <p className="text-sm text-muted-foreground">
                    Analyze opportunities by urgency tier, generate AI valuations
                  </p>
                </div>
                <div className="bg-card p-4 rounded-lg border">
                  <div className="text-2xl font-bold text-primary mb-2">3</div>
                  <h5 className="font-semibold mb-1">Export Intelligence</h5>
                  <p className="text-sm text-muted-foreground">
                    Download search results and market intelligence reports
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center bg-primary text-primary-foreground rounded-2xl p-12">
          <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-lg mb-8 opacity-90">
            Create your first market report or search for acquisition opportunities
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/reports">
              <Button size="lg" variant="secondary" className="gap-2">
                <Upload className="h-5 w-5" />
                New Market Report
              </Button>
            </Link>
            <Link href="/search">
              <Button size="lg" variant="outline" className="gap-2 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                <Search className="h-5 w-5" />
                Start Property Search
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

