import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, FileText, Trash2, Eye, CheckCircle2, Clock, Archive } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'wouter';
import { formatDistanceToNow } from 'date-fns';

export default function Reports() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newReportName, setNewReportName] = useState('');
  const [newReportSubject, setNewReportSubject] = useState('');
  const [newReportDescription, setNewReportDescription] = useState('');

  const { data: reports, isLoading, refetch } = trpc.reports.list.useQuery();

  const createReport = trpc.reports.create.useMutation({
    onSuccess: () => {
      toast.success('Report created successfully!');
      setIsCreateDialogOpen(false);
      setNewReportName('');
      setNewReportSubject('');
      setNewReportDescription('');
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create report: ${error.message}`);
    },
  });

  const deleteReport = trpc.reports.delete.useMutation({
    onSuccess: () => {
      toast.success('Report deleted successfully!');
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete report: ${error.message}`);
    },
  });

  const handleCreateReport = () => {
    if (!newReportName.trim()) {
      toast.error('Please enter a report name');
      return;
    }
    createReport.mutate({
      name: newReportName.trim(),
      subjectPropertyName: newReportSubject.trim() || undefined,
      description: newReportDescription.trim() || undefined,
    });
  };

  const handleDeleteReport = (reportId: number, reportName: string) => {
    if (confirm(`Are you sure you want to delete "${reportName}"? This will remove all associated data.`)) {
      deleteReport.mutate({ reportId });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'archived':
        return <Archive className="h-5 w-5 text-gray-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      complete: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      archived: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Market Survey Reports</h1>
            <p className="text-muted-foreground mt-2">
              Manage your saved market survey reports
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                New Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Report</DialogTitle>
                <DialogDescription>
                  Create a new market survey report. You'll upload AIQ and RedIQ files next.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="reportName">Report Name *</Label>
                  <Input
                    id="reportName"
                    placeholder="e.g., AVEN Apartments Q4 2025"
                    value={newReportName}
                    onChange={(e) => setNewReportName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subjectProperty">Subject Property</Label>
                  <Input
                    id="subjectProperty"
                    placeholder="e.g., AVEN Apartments"
                    value={newReportSubject}
                    onChange={(e) => setNewReportSubject(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add notes about this report..."
                    value={newReportDescription}
                    onChange={(e) => setNewReportDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateReport} disabled={createReport.isPending}>
                  Create Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading reports...</p>
            </div>
          </div>
        ) : !reports || reports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Reports Yet</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Create your first market survey report to get started. Each report can contain one set of AIQ and RedIQ data.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Report
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report: any) => (
              <Card key={report.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(report.status)}
                        {report.name}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {report.subjectPropertyName || 'No subject property'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Data Files:</span>
                      <span className="font-medium">
                        {report.hasAIQ ? '✓' : '✗'} AIQ • {report.hasRedIQ ? '✓' : '✗'} RedIQ
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Floor Plans:</span>
                      <span className="font-medium">{report.floorPlanCount}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Created {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                    </div>
                    {report.description && (
                      <p className="text-sm text-muted-foreground border-t pt-3 mt-3">
                        {report.description}
                      </p>
                    )}
                    <div className="flex gap-2 pt-3 border-t">
                      <Link href={`/report/${report.id}`} className="flex-1">
                        <Button variant="default" size="sm" className="w-full gap-2">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteReport(report.id, report.name)}
                        disabled={deleteReport.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

