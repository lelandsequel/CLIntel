import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface FileUploadProps {
  type: 'AIQ' | 'RedIQ';
  onUploadComplete?: () => void;
}

export function FileUpload({ type, onUploadComplete }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [subjectPropertyName, setSubjectPropertyName] = useState('AVEN Apartments');
  const [isDragging, setIsDragging] = useState(false);

  const uploadAIQ = trpc.data.uploadAIQ.useMutation({
    onSuccess: (data) => {
      toast.success(`AIQ file uploaded successfully! ${data.recordsImported} records imported.`);
      setFile(null);
      onUploadComplete?.();
    },
    onError: (error) => {
      toast.error(`Failed to upload AIQ file: ${error.message}`);
    },
  });

  const uploadRedIQ = trpc.data.uploadRedIQ.useMutation({
    onSuccess: (data) => {
      toast.success(`RedIQ file uploaded successfully! ${data.recordsImported} records imported.`);
      setFile(null);
      onUploadComplete?.();
    },
    onError: (error) => {
      toast.error(`Failed to upload RedIQ file: ${error.message}`);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        toast.error('Please select an Excel file (.xlsx or .xls)');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (!droppedFile.name.endsWith('.xlsx') && !droppedFile.name.endsWith('.xls')) {
        toast.error('Please select an Excel file (.xlsx or .xls)');
        return;
      }
      setFile(droppedFile);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    if (type === 'RedIQ' && !subjectPropertyName.trim()) {
      toast.error('Please enter the subject property name');
      return;
    }

    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const base64Data = base64.split(',')[1]; // Remove data:application/... prefix

        if (type === 'AIQ') {
          await uploadAIQ.mutateAsync({
            fileName: file.name,
            fileData: base64Data,
            subjectPropertyName: subjectPropertyName.trim() || undefined,
          });
        } else {
          await uploadRedIQ.mutateAsync({
            fileName: file.name,
            fileData: base64Data,
            subjectPropertyName: subjectPropertyName.trim(),
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const isUploading = uploadAIQ.isPending || uploadRedIQ.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Upload {type} Data
        </CardTitle>
        <CardDescription>
          {type === 'AIQ' 
            ? 'Upload ApartmentIQ Excel file with "Floor Plan Data" tab'
            : 'Upload RedIQ Excel file with "Floor Plan Summary" tab for the subject property'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {type === 'RedIQ' && (
          <div className="space-y-2">
            <Label htmlFor="subjectProperty">Subject Property Name</Label>
            <Input
              id="subjectProperty"
              value={subjectPropertyName}
              onChange={(e) => setSubjectPropertyName(e.target.value)}
              placeholder="e.g., AVEN Apartments"
              disabled={isUploading}
            />
          </div>
        )}

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {file ? (
            <div className="space-y-2">
              <CheckCircle2 className="h-12 w-12 mx-auto text-green-600" />
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024).toFixed(2)} KB
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFile(null)}
                disabled={isUploading}
              >
                Remove
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="font-medium">Drag and drop your Excel file here</p>
              <p className="text-sm text-muted-foreground">or</p>
              <label htmlFor={`file-upload-${type}`}>
                <Button variant="outline" asChild>
                  <span>Browse Files</span>
                </Button>
                <input
                  id={`file-upload-${type}`}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>
          )}
        </div>

        <Button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload and Process
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

