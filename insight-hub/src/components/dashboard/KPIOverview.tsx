import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "./KPICard";
import type { KPI } from "@/types/dashboard";

interface KPIOverviewProps {
  kpis: KPI[];
  onKPIClick?: (kpi: KPI) => void;
}

export function KPIOverview({ kpis, onKPIClick }: KPIOverviewProps) {
  return (
    <Card className="glass">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">KPI Performance</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time tracking of key performance indicators
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} onClick={onKPIClick} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
