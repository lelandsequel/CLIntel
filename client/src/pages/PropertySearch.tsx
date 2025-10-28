import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, MapPin, Building2, TrendingUp, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'wouter';
import { formatDistanceToNow } from 'date-fns';

export default function PropertySearch() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [geographicArea, setGeographicArea] = useState('');
  const [propertyClass, setPropertyClass] = useState('B- to A+');
  const [minUnits, setMinUnits] = useState('100');
  const [maxUnits, setMaxUnits] = useState('');
  const [searchDepth, setSearchDepth] = useState<'quick' | 'deep'>('quick');
  const [timeframe, setTimeframe] = useState<'24h' | '48h' | '7d' | '30d'>('48h');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringSchedule, setRecurringSchedule] = useState('daily');

  const { data: searches, isLoading, refetch } = trpc.search.list.useQuery();

  const createSearch = trpc.search.create.useMutation({
    onSuccess: async (data) => {
      toast.success('Search created! Starting execution...');
      setIsCreateDialogOpen(false);
      resetForm();
      refetch();
      
      // Automatically execute the search
      try {
        await executeSearch.mutateAsync({ searchId: data.searchId });
      } catch (error) {
        // Error already handled in executeSearch mutation
      }
    },
    onError: (error) => {
      toast.error(`Failed to create search: ${error.message}`);
    },
  });

  const executeSearch = trpc.search.execute.useMutation({
    onSuccess: (data) => {
      toast.success(`Search completed! Found ${data.resultsCount} properties.`);
      refetch();
    },
    onError: (error) => {
      toast.error(`Search execution failed: ${error.message}`);
      refetch();
    },
  });

  const deleteSearch = trpc.search.delete.useMutation({
    onSuccess: () => {
      toast.success('Search deleted successfully!');
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete search: ${error.message}`);
    },
  });

  const resetForm = () => {
    setSearchName('');
    setGeographicArea('');
    setPropertyClass('B- to A+');
    setMinUnits('100');
    setMaxUnits('');
    setSearchDepth('quick');
    setTimeframe('48h');
    setIsRecurring(false);
    setRecurringSchedule('daily');
  };

  const handleCreateSearch = () => {
    if (!searchName.trim()) {
      toast.error('Please enter a search name');
      return;
    }
    if (!geographicArea.trim()) {
      toast.error('Please enter a geographic area');
      return;
    }

    createSearch.mutate({
      name: searchName.trim(),
      geographicArea: geographicArea.trim(),
      propertyClass,
      minUnits: parseInt(minUnits) || 100,
      maxUnits: maxUnits ? parseInt(maxUnits) : undefined,
      searchDepth,
      timeframe,
      isRecurring,
      recurringSchedule: isRecurring ? recurringSchedule : undefined,
    });
  };

  const handleDeleteSearch = (searchId: number, searchName: string) => {
    if (confirm(`Are you sure you want to delete "${searchName}"? This will remove all search results.`)) {
      deleteSearch.mutate({ searchId });
    }
  };

  const handleExecuteSearch = (searchId: number) => {
    executeSearch.mutate({ searchId });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'running':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      running: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Property Search & Intelligence</h1>
            <p className="text-muted-foreground mt-2">
              Discover acquisition opportunities through automated market research
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                New Search
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Property Search</DialogTitle>
                <DialogDescription>
                  Configure your search parameters to discover acquisition opportunities
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="searchName">Search Name *</Label>
                    <Input
                      id="searchName"
                      placeholder="e.g., Dallas Metro Q4 2025"
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="geographicArea">Geographic Area *</Label>
                    <Input
                      id="geographicArea"
                      placeholder="e.g., Dallas, TX or Dallas-Fort Worth Metro"
                      value={geographicArea}
                      onChange={(e) => setGeographicArea(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      City, county, metro area, or state
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="propertyClass">Property Class</Label>
                    <Input
                      id="propertyClass"
                      placeholder="B- to A+"
                      value={propertyClass}
                      onChange={(e) => setPropertyClass(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minUnits">Minimum Units</Label>
                    <Input
                      id="minUnits"
                      type="number"
                      placeholder="100"
                      value={minUnits}
                      onChange={(e) => setMinUnits(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxUnits">Maximum Units (Optional)</Label>
                    <Input
                      id="maxUnits"
                      type="number"
                      placeholder="No limit"
                      value={maxUnits}
                      onChange={(e) => setMaxUnits(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="searchDepth">Search Depth</Label>
                    <Select value={searchDepth} onValueChange={(v) => setSearchDepth(v as 'quick' | 'deep')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quick">Quick Scan</SelectItem>
                        <SelectItem value="deep">Deep Research</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeframe">Timeframe</Label>
                    <Select value={timeframe} onValueChange={(v) => setTimeframe(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24h">Last 24 hours</SelectItem>
                        <SelectItem value="48h">Last 48 hours</SelectItem>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSearch} disabled={createSearch.isPending}>
                  {createSearch.isPending ? 'Creating...' : 'Create & Execute Search'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading searches...</p>
            </div>
          </div>
        ) : !searches || searches.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Search className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Searches Yet</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Create your first property search to discover acquisition opportunities in your target markets.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Search
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {searches.map((search: any) => (
              <Card key={search.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(search.status)}
                        {search.name}
                      </CardTitle>
                      <CardDescription className="mt-2 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {search.geographicArea}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(search.status)}`}>
                        {search.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Results:</span>
                      <span className="font-medium">{search.totalResults || 0}</span>
                    </div>
                    {search.status === 'completed' && search.totalResults > 0 && (
                      <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t">
                        <div className="text-center">
                          <div className="font-semibold text-red-600">{search.immediateOpportunities}</div>
                          <div className="text-muted-foreground">Immediate</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-yellow-600">{search.developingOpportunities}</div>
                          <div className="text-muted-foreground">Developing</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-blue-600">{search.futureOpportunities}</div>
                          <div className="text-muted-foreground">Future</div>
                        </div>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      <div>Min Units: {search.minUnits}</div>
                      <div>Class: {search.propertyClass}</div>
                      <div>Created {formatDistanceToNow(new Date(search.createdAt), { addSuffix: true })}</div>
                    </div>
                    <div className="flex gap-2 pt-3 border-t">
                      {search.status === 'completed' ? (
                        <Link href={`/search/${search.id}`} className="flex-1">
                          <Button variant="default" size="sm" className="w-full gap-2">
                            <TrendingUp className="h-4 w-4" />
                            View Results
                          </Button>
                        </Link>
                      ) : search.status === 'pending' || search.status === 'error' ? (
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={() => handleExecuteSearch(search.id)}
                          disabled={executeSearch.isPending}
                        >
                          <Search className="h-4 w-4" />
                          {search.status === 'error' ? 'Retry' : 'Execute'}
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="flex-1" disabled>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Running...
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSearch(search.id, search.name)}
                        disabled={deleteSearch.isPending || search.status === 'running'}
                      >
                        <XCircle className="h-4 w-4" />
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

