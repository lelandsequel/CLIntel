import { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Building2, MapPin, DollarSign, Users, Calendar, 
  TrendingUp, AlertCircle, Clock, Loader2, ExternalLink,
  Star, MessageSquare
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function SearchResults() {
  const [, params] = useRoute('/search/:id');
  const searchId = params?.id ? parseInt(params.id) : 0;

  const { data, isLoading } = trpc.search.get.useQuery(
    { searchId },
    { enabled: searchId > 0 }
  );

  const updateResult = trpc.search.updateResult.useMutation({
    onSuccess: () => {
      // Refetch to update UI
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="text-center text-lg font-medium">Search not found</p>
            <Link href="/property-search">
              <Button className="mt-4 w-full">Back to Searches</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { search, results } = data;

  const PropertyCard = ({ property }: { property: any }) => {
    const getOpportunityBadge = (type: string) => {
      const badges = {
        new_listing: { label: 'New Listing', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
        distressed_sale: { label: 'Distressed', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
        new_construction: { label: 'New Construction', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
        underperforming: { label: 'Underperforming', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
        company_distress: { label: 'Company Distress', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
        off_market: { label: 'Off-Market', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
      };
      const badge = badges[type as keyof typeof badges] || badges.new_listing;
      return <Badge className={badge.color}>{badge.label}</Badge>;
    };

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {property.propertyName}
              </CardTitle>
              <CardDescription className="mt-2 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {property.address}, {property.city}, {property.state} {property.zipCode}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              {getOpportunityBadge(property.opportunityType)}
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold">{property.score}/100</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Price</div>
                <div className="text-lg font-semibold">
                  ${(property.price / 1000000).toFixed(1)}M
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Price/Unit</div>
                <div className="text-lg font-semibold">
                  ${(property.pricePerUnit / 1000).toFixed(0)}K
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Units</div>
                <div className="text-lg font-semibold flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {property.units}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Class</div>
                <div className="text-lg font-semibold">{property.propertyClass}</div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              {property.occupancyRate && (
                <div>
                  <div className="text-xs text-muted-foreground">Occupancy</div>
                  <div className="text-sm font-medium">{property.occupancyRate}%</div>
                </div>
              )}
              {property.capRate && (
                <div>
                  <div className="text-xs text-muted-foreground">Cap Rate</div>
                  <div className="text-sm font-medium">{property.capRate}%</div>
                </div>
              )}
              {property.yearBuilt && (
                <div>
                  <div className="text-xs text-muted-foreground">Year Built</div>
                  <div className="text-sm font-medium">{property.yearBuilt}</div>
                </div>
              )}
              {property.daysOnMarket !== null && (
                <div>
                  <div className="text-xs text-muted-foreground">Days on Market</div>
                  <div className="text-sm font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {property.daysOnMarket}
                  </div>
                </div>
              )}
            </div>

            {/* Source */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-xs text-muted-foreground">
                Source: {property.dataSource}
              </div>
              {property.sourceUrl && (
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <a href={property.sourceUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                    View Listing
                  </a>
                </Button>
              )}
            </div>

            {/* Status Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant={property.status === 'reviewing' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateResult.mutate({ resultId: property.id, status: 'reviewing' })}
              >
                Review
              </Button>
              <Button
                variant={property.status === 'pursuing' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateResult.mutate({ resultId: property.id, status: 'pursuing' })}
              >
                Pursue
              </Button>
              <Button
                variant={property.status === 'passed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateResult.mutate({ resultId: property.id, status: 'passed' })}
              >
                Pass
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-6">
          <Link href="/property-search">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Searches
            </Button>
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">{search.name}</h1>
              <p className="text-lg text-muted-foreground mt-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {search.geographicArea}
              </p>
              <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                <span>Min Units: {search.minUnits}</span>
                <span>•</span>
                <span>Class: {search.propertyClass}</span>
                <span>•</span>
                <span>Timeframe: {search.timeframe}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{search.totalResults}</div>
              <div className="text-sm text-muted-foreground">Total Opportunities</div>
              <div className="text-xs text-muted-foreground mt-1">
                {search.completedAt && formatDistanceToNow(new Date(search.completedAt), { addSuffix: true })}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                Immediate Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{search.immediateOpportunities}</div>
              <p className="text-xs text-muted-foreground mt-1">Act within 48 hours</p>
            </CardContent>
          </Card>
          <Card className="border-yellow-200 dark:border-yellow-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-yellow-600" />
                Developing Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{search.developingOpportunities}</div>
              <p className="text-xs text-muted-foreground mt-1">Monitor closely, 1-2 weeks</p>
            </CardContent>
          </Card>
          <Card className="border-blue-200 dark:border-blue-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                Future Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{search.futureOpportunities}</div>
              <p className="text-xs text-muted-foreground mt-1">Track for 30-60 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Results Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">
              All Results ({results.all.length})
            </TabsTrigger>
            <TabsTrigger value="immediate" className="text-red-600 data-[state=active]:text-red-600">
              Immediate ({results.immediate.length})
            </TabsTrigger>
            <TabsTrigger value="developing" className="text-yellow-600 data-[state=active]:text-yellow-600">
              Developing ({results.developing.length})
            </TabsTrigger>
            <TabsTrigger value="future" className="text-blue-600 data-[state=active]:text-blue-600">
              Future ({results.future.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {results.all.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <p className="text-muted-foreground">No results found</p>
                </CardContent>
              </Card>
            ) : (
              results.all.map((property: any) => (
                <PropertyCard key={property.id} property={property} />
              ))
            )}
          </TabsContent>

          <TabsContent value="immediate" className="space-y-4">
            {results.immediate.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <p className="text-muted-foreground">No immediate opportunities found</p>
                </CardContent>
              </Card>
            ) : (
              results.immediate.map((property: any) => (
                <PropertyCard key={property.id} property={property} />
              ))
            )}
          </TabsContent>

          <TabsContent value="developing" className="space-y-4">
            {results.developing.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <p className="text-muted-foreground">No developing opportunities found</p>
                </CardContent>
              </Card>
            ) : (
              results.developing.map((property: any) => (
                <PropertyCard key={property.id} property={property} />
              ))
            )}
          </TabsContent>

          <TabsContent value="future" className="space-y-4">
            {results.future.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <p className="text-muted-foreground">No future pipeline opportunities found</p>
                </CardContent>
              </Card>
            ) : (
              results.future.map((property: any) => (
                <PropertyCard key={property.id} property={property} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

