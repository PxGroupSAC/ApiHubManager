import { useState } from "react";
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
  }) => void;
}

export default function StatsFilters({ onApplyFilters }: StatsFiltersProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("24h");
  const [fromDate, setFromDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [interval, setInterval] = useState<string>("hour");
  
  const handlePeriodSelect = (period: string) => {
    setSelectedPeriod(period);
    
    const { fromDate: from, toDate: to } = getDateRange(period);
    setFromDate(from.toISOString().split('T')[0]);
    setToDate(to.toISOString().split('T')[0]);
  };
  
  const handleApply = () => {
    onApplyFilters({
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      interval
    });
  };
  
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div>
            <span className="text-sm text-muted-foreground mr-2">Show last:</span>
            <div className="inline-flex mt-1">
              {TIME_PERIODS.map((period, index) => (
                <Button
                  key={period.value}
                  variant={selectedPeriod === period.value ? "default" : "outline"}
                  className={`text-xs h-8 px-2 ${
                    index === 0 
                      ? "rounded-l-md rounded-r-none" 
                      : index === TIME_PERIODS.length - 1 
                        ? "rounded-r-md rounded-l-none" 
                        : "rounded-none"
                  }`}
                  onClick={() => handlePeriodSelect(period.value)}
                >
                  {period.label}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">From:</Label>
              <Input 
                type="date" 
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">To:</Label>
              <Input 
                type="date" 
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground mr-2">per</span>
            <Select value={interval} onValueChange={setInterval}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Interval" />
              </SelectTrigger>
              <SelectContent>
                {INTERVAL_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Button onClick={handleApply}>
              Apply
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
