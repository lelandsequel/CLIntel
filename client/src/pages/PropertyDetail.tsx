import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/lib/trpc';
import { ArrowLeft, ExternalLink, MapPin, Building2, Calendar } from 'lucide-react';
import DocumentUpload from '@/components/DocumentUpload';

export default function PropertyDetail() {
  const [, params] = useRoute('/properties/:id');
  const [, setLocation] = useLocation();
  const propertyId = params?.id ? parseInt(params.id) : 0;

  const { data: properties } = trpc.properties.list.useQuery();
  const property = properties?.find(p => p.id === propertyId);

  if (!property) {
    return (
      <div className="container py-8">
        <div className="text-center">Property not found</div>
      </div>
    );
  }

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

  const getPropertyTypeLabel = (type: string) => {
    return type === 'acquisition' ? 'Acquisition Target' : 'Management Target';
  };

  return (
    <div className="container py-8">
      <Button
        variant="ghost"
        onClick={() => setLocation(property.propertyType === 'acquisition' ? '/acquisitions' : '/management-targets')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to {property.propertyType === 'acquisition' ? 'Acquisitions' : 'Management Targets'}
      </Button>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              {property.propertyName}
              <Badge variant="outline" className={getUrgencyColor(property.urgencyLevel)}>
                {property.urgencyLevel}
              </Badge>
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-2">
              <MapPin className="h-4 w-4" />
              <span>
                {property.address && `${property.address}, `}
                {property.city}, {property.state}
                {property.zipCode && ` ${property.zipCode}`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <Badge>{getPropertyTypeLabel(property.propertyType)}</Badge>
          <Badge variant="secondary">{getOpportunityLabel(property.opportunityType)}</Badge>
          {property.propertyClass && (
            <Badge variant="outline">Class {property.propertyClass}</Badge>
          )}
          <Badge variant="outline">{property.dataSource}</Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Property Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {property.units && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Units</span>
                    <span className="font-semibold">{property.units.toLocaleString()}</span>
                  </div>
                )}
                {property.yearBuilt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Year Built</span>
                    <span className="font-semibold">{property.yearBuilt}</span>
                  </div>
                )}
                {property.propertyClass && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Property Class</span>
                    <span className="font-semibold">Class {property.propertyClass}</span>
                  </div>
                )}
                {property.occupancyRate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Occupancy</span>
                    <span className="font-semibold">{property.occupancyRate}%</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Financial Details */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {property.price && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-semibold text-lg">
                      ${(property.price / 1000000).toFixed(2)}M
                    </span>
                  </div>
                )}
                {property.pricePerUnit && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price per Unit</span>
                    <span className="font-semibold">${property.pricePerUnit.toLocaleString()}</span>
                  </div>
                )}
                {property.capRate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cap Rate</span>
                    <span className="font-semibold">{property.capRate}%</span>
                  </div>
                )}
                {property.score && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Opportunity Score</span>
                    <span className="font-semibold">{property.score}/100</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Source Information */}
          {property.sourceUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Source</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={property.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Original Listing
                </a>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Added to System</span>
                <span>{new Date(property.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Updated</span>
                <span>{new Date(property.updatedAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <DocumentUpload propertyId={property.id} />
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>
                Internal notes and comments about this property
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Notes feature coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

