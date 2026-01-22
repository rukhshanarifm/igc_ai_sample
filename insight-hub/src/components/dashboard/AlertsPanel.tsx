import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Check, 
  X, 
  Clock,
  ChevronRight 
} from "lucide-react";
import type { Alert } from "@/types/dashboard";

interface AlertsPanelProps {
  alerts: Alert[];
  onAcknowledge?: (alertId: string) => void;
  onDismiss?: (alertId: string) => void;
}

export function AlertsPanel({ alerts, onAcknowledge, onDismiss }: AlertsPanelProps) {
  const [filter, setFilter] = useState<"all" | "new" | "acknowledged">("all");

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === "all") return true;
    return alert.status === filter;
  });

  const getSeverityStyles = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return {
          icon: AlertTriangle,
          bg: "bg-destructive/10",
          border: "border-destructive/30",
          text: "text-destructive",
          badge: "bg-destructive/20 text-destructive border-destructive/30",
        };
      case "warning":
        return {
          icon: AlertCircle,
          bg: "bg-warning/10",
          border: "border-warning/30",
          text: "text-warning",
          badge: "bg-warning/20 text-warning border-warning/30",
        };
      default:
        return {
          icon: Info,
          bg: "bg-primary/10",
          border: "border-primary/30",
          text: "text-primary",
          badge: "bg-primary/20 text-primary border-primary/30",
        };
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const newCount = alerts.filter((a) => a.status === "new").length;

  return (
    <Card className="glass">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-lg">Alerts & Notifications</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {newCount} new alerts require attention
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          {(["all", "new", "acknowledged"] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {filteredAlerts.map((alert) => {
              const styles = getSeverityStyles(alert.severity);
              const Icon = styles.icon;
              
              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg ${styles.bg} border ${styles.border} transition-all hover:scale-[1.01]`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${styles.bg}`}>
                      <Icon className={`h-4 w-4 ${styles.text}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-medium text-sm">{alert.title}</h4>
                        <Badge variant="outline" className={`${styles.badge} shrink-0 text-xs`}>
                          {alert.severity}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {alert.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatTime(alert.createdAt)}
                          {alert.source && (
                            <>
                              <span>•</span>
                              <span>{alert.source}</span>
                            </>
                          )}
                        </div>
                        
                        <div className="flex gap-1">
                          {alert.status === "new" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => onAcknowledge?.(alert.id)}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => onDismiss?.(alert.id)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredAlerts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Check className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No alerts to display</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
