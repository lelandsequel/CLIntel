import { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

type FloorPlanRow = {
  id: number;
  property: string;
  isSubject: boolean;
  floorPlan: string;
  bedrooms: string | null;
  bathrooms: string | null;
  squareFeet: number | null;
  marketRent: string | null;
  amcRent: string | null;
  rentPsf: string | null;
  brokerRent: string | null;
  manualAmcRent: string | null;
  numberOfUnits: number | null;
  rediqColumnS: string | null;
  dataSource: 'AIQ' | 'RedIQ';
};

interface ConsolidatedTableProps {
  data: any[];
  onExport?: (format: 'excel' | 'pdf') => void;
}

type SortField = keyof FloorPlanRow | null;
type SortDirection = 'asc' | 'desc' | null;

export function ConsolidatedTable({ data, onExport }: ConsolidatedTableProps) {
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Transform data to flat structure
  const rows: FloorPlanRow[] = useMemo(() => {
    return data.map(item => ({
      id: item.floorPlan.id,
      property: item.property?.name || 'Unknown',
      isSubject: item.property?.isSubject || false,
      floorPlan: item.floorPlan.floorPlanName || '',
      bedrooms: item.floorPlan.bedrooms,
      bathrooms: item.floorPlan.bathrooms,
      squareFeet: item.floorPlan.squareFeet,
      marketRent: item.floorPlan.marketRent,
      amcRent: item.floorPlan.amcRent,
      rentPsf: item.floorPlan.rentPsf,
      brokerRent: item.floorPlan.brokerRent,
      manualAmcRent: item.floorPlan.manualAmcRent,
      numberOfUnits: item.floorPlan.numberOfUnits,
      rediqColumnS: item.floorPlan.rediqColumnS,
      dataSource: item.floorPlan.dataSource,
    }));
  }, [data]);

  // Sort data
  const sortedRows = useMemo(() => {
    if (!sortField || !sortDirection) return rows;

    return [...rows].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      // Handle null values
      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return sortDirection === 'asc' ? 1 : -1;
      if (bVal === null) return sortDirection === 'asc' ? -1 : 1;

      // Handle numbers
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // Handle strings (including numeric strings)
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      
      // Try to parse as numbers for numeric strings
      const aNum = parseFloat(aStr);
      const bNum = parseFloat(bStr);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
      }

      // String comparison
      if (sortDirection === 'asc') {
        return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
      } else {
        return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
      }
    });
  }, [rows, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="ml-2 h-4 w-4" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const formatCurrency = (value: string | null) => {
    if (!value) return '-';
    const num = parseFloat(value);
    return isNaN(num) ? value : `$${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formatNumber = (value: number | string | null) => {
    if (!value) return '-';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? String(value) : num.toLocaleString();
  };

  const formatPSF = (value: string | null) => {
    if (!value) return '-';
    const num = parseFloat(value);
    return isNaN(num) ? value : `$${num.toFixed(2)}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Consolidated Market Survey Data</CardTitle>
            <CardDescription>
              Subject property highlighted • Click column headers to sort
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport?.('excel')}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport?.('pdf')}
            >
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('property')}
                    className="h-8 px-2"
                  >
                    Property
                    <SortIcon field="property" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('floorPlan')}
                    className="h-8 px-2"
                  >
                    Floor Plan
                    <SortIcon field="floorPlan" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('bedrooms')}
                    className="h-8 px-2"
                  >
                    Bed
                    <SortIcon field="bedrooms" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('bathrooms')}
                    className="h-8 px-2"
                  >
                    Bath
                    <SortIcon field="bathrooms" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('squareFeet')}
                    className="h-8 px-2"
                  >
                    Sq Ft
                    <SortIcon field="squareFeet" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('numberOfUnits')}
                    className="h-8 px-2"
                  >
                    Units
                    <SortIcon field="numberOfUnits" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('marketRent')}
                    className="h-8 px-2"
                  >
                    Market Rent
                    <SortIcon field="marketRent" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('rentPsf')}
                    className="h-8 px-2"
                  >
                    Rent PSF
                    <SortIcon field="rentPsf" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('amcRent')}
                    className="h-8 px-2"
                  >
                    AMC Rent
                    <SortIcon field="amcRent" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('dataSource')}
                    className="h-8 px-2"
                  >
                    Source
                    <SortIcon field="dataSource" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No data available. Upload AIQ and RedIQ files to get started.
                  </TableCell>
                </TableRow>
              ) : (
                sortedRows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={row.isSubject ? 'bg-blue-50 dark:bg-blue-950/20 font-semibold' : ''}
                  >
                    <TableCell>{row.property}</TableCell>
                    <TableCell>{row.floorPlan || '-'}</TableCell>
                    <TableCell>{row.bedrooms || '-'}</TableCell>
                    <TableCell>{row.bathrooms || '-'}</TableCell>
                    <TableCell>{formatNumber(row.squareFeet)}</TableCell>
                    <TableCell>{formatNumber(row.numberOfUnits)}</TableCell>
                    <TableCell>{formatCurrency(row.marketRent)}</TableCell>
                    <TableCell>{formatPSF(row.rentPsf)}</TableCell>
                    <TableCell>{formatCurrency(row.amcRent)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        row.dataSource === 'RedIQ'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {row.dataSource}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {sortedRows.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {sortedRows.length} floor plan{sortedRows.length !== 1 ? 's' : ''}
            {sortField && sortDirection && (
              <span> • Sorted by {sortField} ({sortDirection})</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

