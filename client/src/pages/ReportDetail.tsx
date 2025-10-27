import { useState } from 'react';
import { useRoute } from 'wouter';
import { trpc } from '@/lib/trpc';
import { FileUpload } from '@/components/FileUpload';
import { ConsolidatedTable } from '@/components/ConsolidatedTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'wouter';
import { toast } from 'sonner';

export default function ReportDetail() {
  const [, params] = useRoute('/report/:id');
  const reportId = params?.id ? parseInt(params.id) : 0;
  const [isExporting, setIsExporting] = useState(false);

  const { data: reportData, isLoading, refetch } = trpc.reports.get.useQuery(
    { reportId },
    { enabled: reportId > 0 }
  );

  const exportExcel = trpc.export.exportExcel.useMutation({
    onSuccess: (result) => {
      const binaryString = atob(result.fileData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.fileName;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(`Excel file exported successfully! (${result.recordCount} records)`);
      setIsExporting(false);
    },
    onError: (error) => {
      toast.error(`Failed to export Excel: ${error.message}`);
      setIsExporting(false);
    },
  });

  const handleExport = async (format: 'excel' | 'pdf') => {
    if (format === 'excel') {
      setIsExporting(true);
      await exportExcel.mutateAsync({ subjectPropertyId: reportId });
    } else {
      toast.info('PDF export feature coming soon!');
    }
  };

  const handleUploadComplete = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="text-center text-lg font-medium">Report not found</p>
            <Link href="/reports">
              <Button className="mt-4 w-full">Back to Reports</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { report, imports, floorPlans } = reportData;
  const hasAIQ = imports.some(imp => imp.source === 'AIQ');
  const hasRedIQ = imports.some(imp => imp.source === 'RedIQ');
  const isComplete = hasAIQ && hasRedIQ;

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-6">
          <Link href="/reports">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Reports
            </Button>
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">{report.name}</h1>
              {report.subjectPropertyName && (
                <p className="text-lg text-muted-foreground mt-2">
                  Subject: {report.subjectPropertyName}
                </p>
              )}
              {report.description && (
                <p className="text-muted-foreground mt-1">{report.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isComplete ? (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Complete</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-lg">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Incomplete</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue={isComplete ? "data" : "upload"} className="space-y-6">
          <TabsList>
            <TabsTrigger value="upload">Upload Data</TabsTrigger>
            <TabsTrigger value="data" disabled={!isComplete}>
              View Report {!isComplete && '(Upload files first)'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    ApartmentIQ Data
                    {hasAIQ && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                  </CardTitle>
                  <CardDescription>
                    Upload competitor property data from ApartmentIQ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    type="AIQ"
                    reportId={reportId}
                    onUploadComplete={handleUploadComplete}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    RedIQ Data
                    {hasRedIQ && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                  </CardTitle>
                  <CardDescription>
                    Upload subject property data from RedIQ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    type="RedIQ"
                    reportId={reportId}
                    subjectPropertyName={report.subjectPropertyName || undefined}
                    onUploadComplete={handleUploadComplete}
                  />
                </CardContent>
              </Card>
            </div>

            {!isComplete && (
              <Card className="border-yellow-200 dark:border-yellow-900">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Upload both files to complete this report</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        You need to upload both AIQ (competitor data) and RedIQ (subject property data) files before you can view the consolidated report.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="data">
            {isComplete && floorPlans.length > 0 ? (
              <ConsolidatedTable data={floorPlans} onExport={handleExport} />
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <p className="text-muted-foreground">
                    No data available. Please upload both AIQ and RedIQ files.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

