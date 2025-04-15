import { useEffect, useState } from "react";
import StatsFilters from "@/components/stats-filters";
import StatsGraph from "@/components/stats-graph";
import StatsTable from "@/components/stats-table";
import { getDateRange } from "@/lib/data";
import { apiRequest } from "@/lib/queryClient";

export default function Statistics() {
  const defaultRange = getDateRange("24h");

  const [filters, setFilters] = useState({
    fromDate: defaultRange.fromDate,
    toDate: defaultRange.toDate,
    interval: "hour",
    clientId: ""
  });

  const [clients, setClients] = useState([]);
  const [usage, setUsage] = useState([]);

  useEffect(() => {
    apiRequest("GET", "http://127.0.0.1:8000/clients/all").then(res => res.json()).then(setClients);
  }, []);

  useEffect(() => {
    if (!filters.clientId) return;
    apiRequest("GET", `http://127.0.0.1:8000/usage?client_id=${filters.clientId}`)
      .then(res => res.json())
      .then(setUsage);
  }, [filters]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Statistics</h1>
          <p className="text-sm text-muted-foreground">Usage History</p>
        </div>
      </div>

      <StatsFilters onApplyFilters={setFilters} clients={clients} />

      <StatsGraph data={usage} />
      <StatsTable data={usage} />
    </div>
  );
}
