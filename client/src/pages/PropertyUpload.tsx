import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Upload, Plus, FileText } from 'lucide-react';

export default function PropertyUpload() {
  const [, setLocation] = useLocation();
  const [bulkText, setBulkText] = useState('');
  const [showManualForm, setShowManualForm] = useState(false);
  
  const [formData, setFormData] = useState({
    propertyName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    units: '',
    propertyClass: 'B',
    yearBuilt: '',
    price: '',
    opportunityType: 'new_listing' as const,
    propertyType: 'acquisition' as const,
    urgencyLevel: 'developing' as const,
    dataSource: '',
    sourceUrl: '',
    notes: '',
  });

  const createProperty = trpc.properties.create.useMutation({
    onSuccess: () => {
      toast.success('Property added successfully');
      setFormData({
        propertyName: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        units: '',
        propertyClass: 'B',
        yearBuilt: '',
        price: '',
        opportunityType: 'new_listing',
        propertyType: 'acquisition',
        urgencyLevel: 'developing',
        dataSource: '',
        sourceUrl: '',
        notes: '',
      });
    },
    onError: (error) => {
      toast.error(`Failed to add property: ${error.message}`);
    },
  });

  const bulkUpload = trpc.properties.bulkCreate.useMutation({
    onSuccess: (data) => {
      toast.success(`Successfully added ${data.count} properties`);
      setBulkText('');
      setLocation('/properties');
    },
    onError: (error) => {
      toast.error(`Bulk upload failed: ${error.message}`);
    },
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProperty.mutate({
      ...formData,
      units: formData.units ? parseInt(formData.units) : undefined,
      yearBuilt: formData.yearBuilt ? parseInt(formData.yearBuilt) : undefined,
      price: formData.price ? parseFloat(formData.price) : undefined,
    });
  };

  const handleBulkUpload = () => {
    if (!bulkText.trim()) {
      toast.error('Please paste property data');
      return;
    }
    
    bulkUpload.mutate({ text: bulkText });
  };

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add Properties</h1>
        <p className="text-muted-foreground mt-2">
          Upload property search results from your research
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Bulk Upload */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <CardTitle>Bulk Upload</CardTitle>
            </div>
            <CardDescription>
              Paste property data from your search results (CSV, JSON, or plain text)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bulk-text">Property Data</Label>
              <Textarea
                id="bulk-text"
                placeholder="Paste property information here...&#10;&#10;Example:&#10;Property Name, City, State, Units, Price&#10;Sunset Apartments, Houston, TX, 150, 12500000&#10;Oak Ridge Complex, Dallas, TX, 200, 18000000"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
            </div>
            <Button 
              onClick={handleBulkUpload}
              disabled={bulkUpload.isPending || !bulkText.trim()}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              {bulkUpload.isPending ? 'Uploading...' : 'Upload Properties'}
            </Button>
          </CardContent>
        </Card>

        {/* Manual Entry */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              <CardTitle>Manual Entry</CardTitle>
            </div>
            <CardDescription>
              Add a single property with detailed information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showManualForm ? (
              <Button onClick={() => setShowManualForm(true)} variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Property Manually
              </Button>
            ) : (
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="propertyName">Property Name *</Label>
                  <Input
                    id="propertyName"
                    value={formData.propertyName}
                    onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      required
                      maxLength={2}
                      placeholder="TX"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="units">Units</Label>
                    <Input
                      id="units"
                      type="number"
                      value={formData.units}
                      onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="propertyType">Property Type</Label>
                  <Select
                    value={formData.propertyType}
                    onValueChange={(value: any) => setFormData({ ...formData, propertyType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="acquisition">Acquisition Target</SelectItem>
                      <SelectItem value="management_target">Management Target</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="opportunityType">Opportunity Type</Label>
                  <Select
                    value={formData.opportunityType}
                    onValueChange={(value: any) => setFormData({ ...formData, opportunityType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new_listing">New Listing</SelectItem>
                      <SelectItem value="distressed_sale">Distressed Sale</SelectItem>
                      <SelectItem value="new_construction">New Construction</SelectItem>
                      <SelectItem value="underperforming">Underperforming</SelectItem>
                      <SelectItem value="company_distress">Company Distress</SelectItem>
                      <SelectItem value="off_market">Off Market</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sourceUrl">Source URL</Label>
                  <Input
                    id="sourceUrl"
                    type="url"
                    value={formData.sourceUrl}
                    onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                    placeholder="https://loopnet.com/..."
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={createProperty.isPending} className="flex-1">
                    {createProperty.isPending ? 'Adding...' : 'Add Property'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowManualForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

