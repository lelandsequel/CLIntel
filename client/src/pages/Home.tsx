import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSpreadsheet, Upload, BarChart3, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { APP_TITLE } from "@/const";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="container py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <FileSpreadsheet className="h-4 w-4" />
            Real Estate Data Automation
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Streamline Your Market Survey Workflow
          </h1>
          <p className="text-xl text-muted-foreground">
            Automatically consolidate ApartmentIQ and RedIQ data into client-ready reports. 
            Save hours of manual work with intelligent data processing and beautiful exports.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/reports">
              <Button size="lg" className="gap-2">
                <BarChart3 className="h-5 w-5" />
                Get Started
              </Button>
            </Link>
            <Link href="/reports">
              <Button size="lg" variant="outline" className="gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                View Reports
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Smart Data Ingestion</CardTitle>
              <CardDescription>
                Upload ApartmentIQ and RedIQ Excel files with automatic validation and parsing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Automatic column mapping
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Data validation & error handling
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Subject property detection
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Consolidated Reports</CardTitle>
              <CardDescription>
                View all data in one sortable, filterable table with clear subject highlighting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Sort by any column
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Subject property highlighting
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Real-time data updates
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <FileSpreadsheet className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Client-Ready Exports</CardTitle>
              <CardDescription>
                Export to Excel or PDF with professional formatting for client presentations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Excel export with formatting
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  PDF generation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Summary tables included
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Upload Your Data</h3>
                <p className="text-muted-foreground">
                  Upload ApartmentIQ Excel file with competitor data and RedIQ file with subject property data. 
                  The system automatically validates and parses both files.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Automatic Consolidation</h3>
                <p className="text-muted-foreground">
                  The app intelligently merges data from both sources, using RedIQ data for the subject property 
                  and ApartmentIQ data for competitors, with automatic calculations for rent PSF and other metrics.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Review & Export</h3>
                <p className="text-muted-foreground">
                  View the consolidated report with sortable columns and clear subject highlighting. 
                  Export to Excel or PDF for client presentations with professional formatting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Ready to Get Started?</CardTitle>
            <CardDescription className="text-primary-foreground/80 text-lg">
              Upload your first files and see the magic happen
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/reports">
              <Button size="lg" variant="secondary" className="gap-2">
                <BarChart3 className="h-5 w-5" />
                Create Report Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

