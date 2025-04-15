import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { fetchMethodStats } from "@/lib/data";

interface StatsGraphProps {
  fromDate: Date;
  toDate: Date;
  interval: string;
}

export default function StatsGraph({ fromDate, toDate, interval }: StatsGraphProps) {
  const [selectedApp, setSelectedApp] = useState<string>("all");
  
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['/api/statistics/method-stats', fromDate.toISOString(), toDate.toISOString()],
    queryFn: () => fetchMethodStats(fromDate, toDate)
  });
  
  // Placeholder for how data would be formatted for charts
  const chartData = statsData && statsData.length > 0 
    ? [...Array(10)].map((_, index) => ({
        name: `${index + 1}h`,
        value: Math.floor(Math.random() * 10)
      }))
    : [];
  
  const hasData = chartData && chartData.length > 0;
  
  return (
    <Card className="mb-6">
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">Graphs</CardTitle>
        <Select value={selectedApp} onValueChange={setSelectedApp}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select application" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Applications</SelectItem>
            <SelectItem value="test1">test1</SelectItem>
            <SelectItem value="fiajero-app">fiajero-group.com's App</SelectItem>
            <SelectItem value="desarrollo">Desarrollo</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="h-[250px] w-full">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">Loading data...</p>
            </div>
          ) : !hasData ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">There is no data available for the selected period</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="hsl(216, 92%, 59%)" fill="rgba(59, 130, 246, 0.2)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground mt-2">
          Using time zone (GMT-05:00) Eastern Time (US & Canada)
        </div>
      </CardContent>
    </Card>
  );
}
