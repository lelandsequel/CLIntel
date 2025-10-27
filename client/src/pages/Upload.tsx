import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Upload() {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { data: importHistory, isLoading } = trpc.data.getImportHistory.useQuery(undefined, {
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const handleUploadComplete = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Data Upload</h1>
          <p className="text-muted-foreground mt-2">
            Upload ApartmentIQ and RedIQ Excel files to consolidate market survey data
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <FileUpload type="AIQ" onUploadComplete={handleUploadComplete} />
          <FileUpload type="RedIQ" onUploadComplete={handleUploadComplete} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Import History</CardTitle>
            <CardDescription>
              Recent file uploads and processing status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !importHistory || importHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No imports yet. Upload your first file to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {importHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        {item.status === 'completed' && (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        )}
                        {item.status === 'error' && (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        {item.status === 'processing' && (
                          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                        )}
                        {item.status === 'pending' && (
                          <Clock className="h-5 w-5 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{item.fileName || 'Unknown file'}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.source} • {formatDistanceToNow(new Date(item.importDate), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {item.status === 'completed' && (
                        <div className="text-sm">
                          <p className="text-green-600 font-medium">
                            {item.recordsImported} records imported
                          </p>
                          {item.recordsFailed ? (
                            <p className="text-red-600">{item.recordsFailed} failed</p>
                          ) : null}
                          {item.processingTimeMs && (
                            <p className="text-muted-foreground">
                              {(item.processingTimeMs / 1000).toFixed(2)}s
                            </p>
                          )}
                        </div>
                      )}
                      {item.status === 'error' && (
                        <p className="text-sm text-red-600">
                          {item.errorMessage || 'Failed to process'}
                        </p>
                      )}
                      {item.status === 'processing' && (
                        <p className="text-sm text-blue-600">Processing...</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

