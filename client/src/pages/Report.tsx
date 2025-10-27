import { ConsolidatedTable } from '@/components/ConsolidatedTable';
import { trpc } from '@/lib/trpc';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

export default function Report() {
  const { data, isLoading, refetch } = trpc.data.getConsolidatedData.useQuery({});
  const [isExporting, setIsExporting] = useState(false);

  const exportExcel = trpc.export.exportExcel.useMutation({
    onSuccess: (result) => {
      // Convert base64 to blob and download
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
      await exportExcel.mutateAsync({});
    } else {
      toast.info('PDF export feature coming soon!');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Market Survey Report</h1>
          <p className="text-muted-foreground mt-2">
            Consolidated data from ApartmentIQ and RedIQ sources
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ConsolidatedTable data={data || []} onExport={handleExport} />
        )}
      </div>
    </div>
  );
}

