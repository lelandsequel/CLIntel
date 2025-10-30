import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { Plus, ExternalLink, Trash2, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ManagementTargets() {
  const { data: properties, isLoading, refetch } = trpc.properties.list.useQuery({ propertyType: 'management_target' });
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
        <div className="text-center">Loading management_target targets...</div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Management Targets</h1>
          <p className="text-muted-foreground mt-2">
            Properties identified for potential management_target
          </p>
        </div>
        <Link href="/properties/upload">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Properties
          </Button>
        </Link>
      </div>

      {!properties || properties.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No management_target targets yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Upload properties you're interested in managing
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

