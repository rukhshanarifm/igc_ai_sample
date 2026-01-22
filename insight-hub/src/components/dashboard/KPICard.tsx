import { TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { KPI } from "@/types/dashboard";

interface KPICardProps {
  kpi: KPI;
  onClick?: (kpi: KPI) => void;
}

export function KPICard({ kpi, onClick }: KPICardProps) {
  const getTrendIcon = () => {
    switch (kpi.trend) {
      case "up":
        return <TrendingUp className="h-4 w-4" />;
      case "down":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendColor = () => {
    switch (kpi.trend) {
      case "up":
        return "text-success bg-success/10 border-success/20";
      case "down":
        return "text-destructive bg-destructive/10 border-destructive/20";
      default:
        return "text-muted-foreground bg-muted border-border";
    }
  };

  const getScoreColor = () => {
    if (kpi.currentScore >= 70) return "text-success";
    if (kpi.currentScore >= 50) return "text-warning";
    return "text-destructive";
  };

  const change = kpi.currentScore - kpi.previousScore;

  return (
    <Card
      className="glass group hover:border-primary/30 transition-all cursor-pointer"
      onClick={() => onClick?.(kpi)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <Badge variant="outline" className="text-xs font-normal mb-2">
              {kpi.category}
            </Badge>
            <h3 className="font-semibold leading-tight">{kpi.name}</h3>
          </div>
          <Badge className={`${getTrendColor()} border`}>
            {getTrendIcon()}
            <span className="ml-1 text-xs">
              {change > 0 ? "+" : ""}{change}
            </span>
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-end gap-2">
            <span className={`text-4xl font-bold tracking-tight ${getScoreColor()}`}>
              {kpi.currentScore}
            </span>
            <span className="text-muted-foreground text-sm mb-1">/100</span>
          </div>

          <Progress value={kpi.currentScore} className="h-2" />

          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <span className="text-xs text-muted-foreground">
              {kpi.articleCount} articles linked
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
