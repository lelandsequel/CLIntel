import { useState } from 'react';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { trpc } from '../lib/trpc';

interface ParsedProperty {
  propertyName: string;
  address?: string;
  city: string;
  state: string;
  units?: number;
  yearBuilt?: number;
  price?: number;
  debtAmount?: string;
  currentOwner?: string;
  lender?: string;
  foreclosureStatus?: string;
  buyRationale?: string;
  notes?: string;
  propertyType: 'acquisition' | 'management_target';
  opportunityType?: 'new_listing' | 'distressed_sale' | 'off_market' | 'new_construction' | 'underperforming' | 'company_distress';
  urgencyLevel?: 'immediate' | 'developing' | 'future';
}

interface TextFileConverterProps {
  propertyType: 'acquisition' | 'management_target';
  onUploadComplete?: () => void;
}

export function TextFileConverter({ propertyType, onUploadComplete }: TextFileConverterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedProperties, setParsedProperties] = useState<ParsedProperty[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: number; failed: number } | null>(null);

  const createMutation = trpc.properties.create.useMutation();

  const parseTextFile = async (fileContent: string): Promise<ParsedProperty[]> => {
    const properties: ParsedProperty[] = [];
    const lines = fileContent.split('\n');
    
    let currentProperty: Partial<ParsedProperty> | null = null;
    let currentSection: 'immediate' | 'developing' | 'future' = 'immediate';
    let buyRationaleLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines and headers
      if (!line || line.startsWith('Property & Location') || line.startsWith('Key Takeaways')) {
        continue;
      }

      // Detect section headers
      if (line.toLowerCase().includes('immediate opportunities')) {
        currentSection = 'immediate';
        continue;
      } else if (line.toLowerCase().includes('developing opportunities')) {
        currentSection = 'developing';
        continue;
      } else if (line.toLowerCase().includes('future pipeline') || line.toLowerCase().includes('repeat offenders')) {
        currentSection = 'future';
        continue;
      }

      // Parse property line (format: "Property Name - City (Address)")
      const propertyMatch = line.match(/^([^–-]+)[–-]\s*([^(]+)(?:\(([^)]+)\))?/);
      if (propertyMatch) {
        // Save previous property if exists
        if (currentProperty && currentProperty.propertyName) {
          if (buyRationaleLines.length > 0) {
            currentProperty.buyRationale = buyRationaleLines.join('\n').trim();
          }
          properties.push(currentProperty as ParsedProperty);
          buyRationaleLines = [];
        }

        const propertyName = propertyMatch[1].trim();
        const cityState = propertyMatch[2].trim();
        const address = propertyMatch[3]?.trim();

        // Extract city and state
        let city = cityState;
        let state = 'TX'; // Default to TX
        
        const cityStateMatch = cityState.match(/^([^,]+),?\s*([A-Z]{2})?/);
        if (cityStateMatch) {
          city = cityStateMatch[1].trim();
          if (cityStateMatch[2]) {
            state = cityStateMatch[2];
          }
        }

        currentProperty = {
          propertyName,
          city,
          state,
          address,
          propertyType,
          urgencyLevel: currentSection,
          opportunityType: 'distressed_sale',
        };
        continue;
      }

      // Parse units and year built (format: "265 units (2016)")
      const unitsMatch = line.match(/(\d+)\s*units.*?\((\d{4})\)/i);
      if (unitsMatch && currentProperty) {
        currentProperty.units = parseInt(unitsMatch[1]);
        currentProperty.yearBuilt = parseInt(unitsMatch[2]);
        continue;
      }

      // Parse debt amount (format: "$42 M mortgage" or "$42,000,000")
      const debtMatch = line.match(/\$\s*([\d,.]+)\s*([MB])?/i);
      if (debtMatch && currentProperty && (line.toLowerCase().includes('mortgage') || line.toLowerCase().includes('loan'))) {
        let amount = parseFloat(debtMatch[1].replace(/,/g, ''));
        if (debtMatch[2]?.toUpperCase() === 'M') {
          amount *= 1000000;
        } else if (debtMatch[2]?.toUpperCase() === 'B') {
          amount *= 1000000000;
        }
        if (currentProperty) {
          currentProperty.debtAmount = amount.toString();
          currentProperty.price = amount; // Use debt as price estimate

          // Extract lender from same line
          const lenderMatch = line.match(/(?:via|by|from)\s+([^;,]+)/i);
          if (lenderMatch) {
            currentProperty.lender = lenderMatch[1].trim();
          }
        }
        continue;
      }

      // Parse foreclosure status
      if (line.toLowerCase().includes('foreclosure') || line.toLowerCase().includes('auction') || line.toLowerCase().includes('special servicing')) {
        if (currentProperty) {
          currentProperty.foreclosureStatus = line.trim();
        }
        continue;
      }

      // Parse owner
      if (line.toLowerCase().includes('owner') && !line.toLowerCase().includes('current owner')) {
        const ownerMatch = line.match(/owner[:\s]+([^;,]+)/i);
        if (ownerMatch && currentProperty) {
          currentProperty.currentOwner = ownerMatch[1].trim();
        }
        continue;
      }

      // Collect buy rationale lines (everything else that's not a URL or period)
      if (currentProperty && line !== '.' && !line.startsWith('http') && !line.includes('.com') && !line.includes('.net')) {
        // Skip evidence/source lines
        if (!line.toLowerCase().includes('real deal') && 
            !line.toLowerCase().includes('multifamily dive') &&
            !line.toLowerCase().includes('evidence')) {
          buyRationaleLines.push(line);
        }
      }
    }

    // Save last property
    if (currentProperty && currentProperty.propertyName) {
      if (buyRationaleLines.length > 0) {
        currentProperty.buyRationale = buyRationaleLines.join('\n').trim();
      }
      properties.push(currentProperty as ParsedProperty);
    }

    return properties;
  };

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setParseError(null);
    setParsedProperties([]);
    setUploadResult(null);

    try {
      const content = await selectedFile.text();
      const parsed = await parseTextFile(content);
      
      if (parsed.length === 0) {
        setParseError('No properties found in file. Please check the file format.');
        return;
      }

      setParsedProperties(parsed);
    } catch (error) {
      setParseError(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/plain') {
      handleFileSelect(droppedFile);
    } else {
      setParseError('Please drop a .txt file');
    }
  };

  const handleUpload = async () => {
    if (parsedProperties.length === 0) return;

    setUploading(true);
    let successCount = 0;
    let failedCount = 0;

    for (const property of parsedProperties) {
      try {
        await createMutation.mutateAsync({
          propertyName: property.propertyName,
          address: property.address || undefined,
          city: property.city,
          state: property.state,
          units: property.units,
          yearBuilt: property.yearBuilt,
          price: property.price,
          debtAmount: property.debtAmount,
          currentOwner: property.currentOwner,
          lender: property.lender,
          foreclosureStatus: property.foreclosureStatus,
          buyRationale: property.buyRationale,
          notes: property.notes,
          propertyType: property.propertyType,
          opportunityType: property.opportunityType || 'distressed_sale',
          urgencyLevel: property.urgencyLevel || 'developing',
        });
        successCount++;
      } catch (error) {
        console.error(`Failed to upload ${property.propertyName}:`, error);
        failedCount++;
      }
    }

    setUploading(false);
    setUploadResult({ success: successCount, failed: failedCount });

    if (successCount > 0 && onUploadComplete) {
      setTimeout(() => {
        onUploadComplete();
      }, 2000);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".txt"
          className="hidden"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0];
            if (selectedFile) handleFileSelect(selectedFile);
          }}
        />
        
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {file ? file.name : 'Drop your .txt file here or click to browse'}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Supports formatted property lists with units, debt, owner, lender, and rationale
        </p>
      </div>

      {parseError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Parse Error</p>
            <p className="text-sm text-red-700 mt-1">{parseError}</p>
          </div>
        </div>
      )}

      {parsedProperties.length > 0 && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800">
                  Found {parsedProperties.length} {parsedProperties.length === 1 ? 'property' : 'properties'}
                </p>
                <div className="mt-3 space-y-2 max-h-96 overflow-y-auto">
                  {parsedProperties.map((prop, idx) => (
                    <div key={idx} className="bg-white rounded border border-blue-200 p-3 text-sm">
                      <div className="font-medium text-gray-900">{prop.propertyName}</div>
                      <div className="text-gray-600 text-xs mt-1">
                        {prop.city}, {prop.state}
                        {prop.units && ` • ${prop.units} units`}
                        {prop.debtAmount && ` • $${(parseFloat(prop.debtAmount) / 1000000).toFixed(2)}M debt`}
                        {prop.urgencyLevel && ` • ${prop.urgencyLevel}`}
                      </div>
                      {prop.foreclosureStatus && (
                        <div className="text-xs text-red-600 mt-1">🔴 {prop.foreclosureStatus}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                Upload {parsedProperties.length} {parsedProperties.length === 1 ? 'Property' : 'Properties'}
              </>
            )}
          </button>
        </div>
      )}

      {uploadResult && (
        <div className={`border rounded-lg p-4 ${uploadResult.failed === 0 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="flex items-start gap-3">
            {uploadResult.failed === 0 ? (
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`text-sm font-medium ${uploadResult.failed === 0 ? 'text-green-800' : 'text-yellow-800'}`}>
                Upload Complete
              </p>
              <p className={`text-sm mt-1 ${uploadResult.failed === 0 ? 'text-green-700' : 'text-yellow-700'}`}>
                Successfully uploaded {uploadResult.success} {uploadResult.success === 1 ? 'property' : 'properties'}
                {uploadResult.failed > 0 && `, ${uploadResult.failed} failed`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

