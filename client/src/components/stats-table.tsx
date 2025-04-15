import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { fetchMethodStats, formatStatDate } from "@/lib/data";

interface StatsTableProps {
  fromDate: Date;
  toDate: Date;
}

export default function StatsTable({ fromDate, toDate }: StatsTableProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/statistics/method-stats', fromDate.toISOString(), toDate.toISOString()],
    queryFn: () => fetchMethodStats(fromDate, toDate)
  });
  
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Method</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Traffic</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">Loading data...</TableCell>
                </TableRow>
              ) : !stats || stats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">No data available for the selected period</TableCell>
                </TableRow>
              ) : (
                stats.map((stat, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{stat.method}</TableCell>
                    <TableCell>{formatStatDate(stat.from)}</TableCell>
                    <TableCell>{formatStatDate(stat.to)}</TableCell>
                    <TableCell>{stat.traffic}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
