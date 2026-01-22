import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Target, X } from "lucide-react";
import type { KPI } from "@/types/dashboard";

interface KPIFilterProps {
  kpis: KPI[];
  selectedKPIs: string[];
  onKPIsChange: (kpiIds: string[]) => void;
}

export function KPIFilter({ kpis, selectedKPIs, onKPIsChange }: KPIFilterProps) {
  const handleToggle = (kpiId: string) => {
    if (selectedKPIs.includes(kpiId)) {
      onKPIsChange(selectedKPIs.filter((id) => id !== kpiId));
    } else {
      onKPIsChange([...selectedKPIs, kpiId]);
    }
  };

  const handleClear = () => {
    onKPIsChange([]);
  };

  const handleSelectAll = () => {
    onKPIsChange(kpis.map((k) => k.id));
  };

  const getTrendColor = (trend: KPI["trend"]) => {
    switch (trend) {
      case "up": return "bg-success";
      case "down": return "bg-destructive";
      default: return "bg-muted";
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Target className="h-4 w-4" />
          KPIs
          {selectedKPIs.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
              {selectedKPIs.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Filter by KPI</h4>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                All
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClear}>
                Clear
              </Button>
            </div>
          </div>
          
          <div className="space-y-2 max-h-[300px] overflow-auto">
            {kpis.map((kpi) => (
              <div
                key={kpi.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 cursor-pointer"
                onClick={() => handleToggle(kpi.id)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedKPIs.includes(kpi.id)}
                    onCheckedChange={() => handleToggle(kpi.id)}
                  />
                  <div>
                    <span className="text-sm font-medium">{kpi.name}</span>
                    <p className="text-xs text-muted-foreground">{kpi.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${getTrendColor(kpi.trend)}`} />
                  <span className="text-sm font-medium">{kpi.currentScore}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
