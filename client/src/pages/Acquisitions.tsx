import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { Plus, ExternalLink, Trash2, Building2, FileText } from 'lucide-react';
import { TextFileConverter } from '../components/TextFileConverter';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Acquisitions() {
  const [showFileConverter, setShowFileConverter] = useState(false);
  const { data: properties, isLoading, refetch } = trpc.properties.list.useQuery({ propertyType: 'acquisition' });
  const deleteProperty = trpc.properties.delete.useMutation({
    onSuccess: () => {
      toast.success('Property deleted');
      refetch();
    },
  });

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'immediate': return 'bg-red-500';
      case 'developing': return 'bg-yellow-500';
      case 'future': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getOpportunityLabel = (type: string) => {
    const labels: Record<string, string> = {
      new_listing: 'New Listing',
      distressed_sale: 'Distressed',
      new_construction: 'New Construction',
      underperforming: 'Underperforming',
      company_distress: 'Company Distress',
      off_market: 'Off Market',
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">Loading acquisition targets...</div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Acquisition Targets</h1>
          <p className="text-muted-foreground mt-2">
            Properties identified for potential acquisition
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFileConverter(!showFileConverter)}>
            <FileText className="mr-2 h-4 w-4" />
            Import Text File
          </Button>
          <Link href="/properties/upload">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Properties
            </Button>
          </Link>
        </div>
      </div>

      {showFileConverter && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Import from Text File</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowFileConverter(false)}>
                ×
              </Button>
            </div>
            <CardDescription>
              Upload a .txt file with property data to automatically parse and import
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TextFileConverter
              propertyType="acquisition"
              onUploadComplete={() => {
                setShowFileConverter(false);
                refetch();
              }}
            />
          </CardContent>
        </Card>
      )}

      {!properties || properties.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No acquisition targets yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Upload properties you're interested in acquiring
            </p>
            <Link href="/properties/upload">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Properties
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {properties.map((property) => (
            <Link href={`/properties/${property.id}`} key={property.id}>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {property.propertyName}
                      <Badge variant="outline" className={getUrgencyColor(property.urgencyLevel)}>
                        {property.urgencyLevel}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {property.address && `${property.address}, `}
                      {property.city}, {property.state}
                      {property.zipCode && ` ${property.zipCode}`}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteProperty.mutate({ id: property.id })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {property.units && (
                    <div>
                      <div className="text-sm text-muted-foreground">Units</div>
                      <div className="font-semibold">{property.units.toLocaleString()}</div>
                    </div>
                  )}
                  {property.price && (
                    <div>
                      <div className="text-sm text-muted-foreground">Price</div>
                      <div className="font-semibold">${(property.price / 1000000).toFixed(2)}M</div>
                    </div>
                  )}
                  {property.pricePerUnit && (
                    <div>
                      <div className="text-sm text-muted-foreground">Price/Unit</div>
                      <div className="font-semibold">${property.pricePerUnit.toLocaleString()}</div>
                    </div>
                  )}
                  {property.yearBuilt && (
                    <div>
                      <div className="text-sm text-muted-foreground">Year Built</div>
                      <div className="font-semibold">{property.yearBuilt}</div>
                    </div>
                  )}
                </div>

                {/* Multifamily Acquisition Details */}
                {(property.debtAmount || property.currentOwner || property.lender || property.foreclosureStatus) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 p-3 bg-muted/50 rounded-lg">
                    {property.debtAmount && (
                      <div>
                        <div className="text-sm text-muted-foreground">Debt Amount</div>
                        <div className="font-medium">{property.debtAmount}</div>
                      </div>
                    )}
                    {property.currentOwner && (
                      <div>
                        <div className="text-sm text-muted-foreground">Current Owner</div>
                        <div className="font-medium">{property.currentOwner}</div>
                      </div>
                    )}
                    {property.lender && (
                      <div>
                        <div className="text-sm text-muted-foreground">Lender</div>
                        <div className="font-medium">{property.lender}</div>
                      </div>
                    )}
                    {property.foreclosureStatus && (
                      <div>
                        <div className="text-sm text-muted-foreground">Foreclosure Status</div>
                        <div className="font-medium text-red-600">{property.foreclosureStatus}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Buy Rationale */}
                {property.buyRationale && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Buy Rationale</div>
                    <div className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-line">{property.buyRationale}</div>
                  </div>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary">
                    {getOpportunityLabel(property.opportunityType)}
                  </Badge>
                  {property.propertyClass && (
                    <Badge variant="outline">Class {property.propertyClass}</Badge>
                  )}
                  <Badge variant="outline">{property.dataSource}</Badge>
                  {property.sourceUrl && (
                    <a
                      href={property.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto"
                    >
                      <Button variant="outline" size="sm">
                        <ExternalLink className="mr-2 h-3 w-3" />
                        View Listing
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

