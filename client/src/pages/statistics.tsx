import { useState } from "react";
import StatsFilters from "@/components/stats-filters";
import StatsGraph from "@/components/stats-graph";
import StatsTable from "@/components/stats-table";
import { getDateRange } from "@/lib/data";

export default function Statistics() {
  // Default date range: last 24 hours
  const defaultRange = getDateRange("24h");
  const [filters, setFilters] = useState({
    fromDate: defaultRange.fromDate,
    toDate: defaultRange.toDate,
    interval: "hour"
  });
  
  const handleApplyFilters = (newFilters: {
    fromDate: Date;
    toDate: Date;
    interval: string;
  }) => {
    setFilters(newFilters);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Statistics</h1>
          <p className="text-sm text-muted-foreground">Usage History</p>
        </div>
      </div>
      
      <StatsFilters onApplyFilters={handleApplyFilters} />
      
      <StatsGraph
        fromDate={filters.fromDate}
        toDate={filters.toDate}
        interval={filters.interval}
      />
      
      <StatsTable
        fromDate={filters.fromDate}
        toDate={filters.toDate}
      />
    </div>
  );
}
