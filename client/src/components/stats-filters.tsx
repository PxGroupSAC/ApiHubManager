import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TIME_PERIODS, INTERVAL_OPTIONS, getDateRange } from "@/lib/data";

interface StatsFiltersProps {
  onApplyFilters: (filters: {
    fromDate: Date;
    toDate: Date;
    interval: string;
    clientId: string;
  }) => void;
  clients?: { id: string; name: string }[];
}

export default function StatsFilters({ onApplyFilters, clients = [] }: StatsFiltersProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("24h");
  const [fromDate, setFromDate] = useState(new Date().toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const [interval, setInterval] = useState("hour");
  const [clientId, setClientId] = useState("");

  useEffect(() => {
    if (clients.length > 0) {
      setClientId(clients[0].id);
    }
  }, [clients]);

  const handleApply = () => {
    onApplyFilters({
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      interval,
      clientId,
    });
  };

  return (
    <Card className="mb-4">
      <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
        <div>
          <Label>Periodo</Label>
          <Select value={selectedPeriod} onValueChange={(period) => {
            setSelectedPeriod(period);
            const { fromDate, toDate } = getDateRange(period);
            setFromDate(fromDate);
            setToDate(toDate);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              {TIME_PERIODS.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Desde</Label>
          <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </div>
        <div>
          <Label>Hasta</Label>
          <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>
        <div>
          <Label>Cliente</Label>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Intervalo</Label>
          <Select value={interval} onValueChange={setInterval}>
            <SelectTrigger>
              <SelectValue placeholder="Intervalo" />
            </SelectTrigger>
            <SelectContent>
              {INTERVAL_OPTIONS.map((intv) => (
                <SelectItem key={intv.value} value={intv.value}>{intv.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-full">
          <Button onClick={handleApply} className="w-full mt-2">
            Aplicar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
