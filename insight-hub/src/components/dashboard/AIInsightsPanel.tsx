import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  Activity,
  Sparkles,
  ChevronRight
} from "lucide-react";
import type { AIInsight } from "@/types/dashboard";

interface AIInsightsPanelProps {
  insights: AIInsight[];
}

export function AIInsightsPanel({ insights }: AIInsightsPanelProps) {
  const getTypeStyles = (type: AIInsight["type"]) => {
    switch (type) {
      case "trend":
        return {
          icon: TrendingUp,
          bg: "bg-success/10",
          border: "border-success/30",
          text: "text-success",
          label: "Trend",
        };
      case "risk":
        return {
          icon: AlertTriangle,
          bg: "bg-destructive/10",
          border: "border-destructive/30",
          text: "text-destructive",
          label: "Risk",
        };
      case "recommendation":
        return {
          icon: Lightbulb,
          bg: "bg-warning/10",
          border: "border-warning/30",
          text: "text-warning",
          label: "Recommendation",
        };
      case "anomaly":
        return {
          icon: Activity,
          bg: "bg-chart-3/10",
          border: "border-chart-3/30",
          text: "text-chart-3",
          label: "Anomaly",
        };
      default:
        return {
          icon: Brain,
          bg: "bg-primary/10",
          border: "border-primary/30",
          text: "text-primary",
          label: "Insight",
        };
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return "text-success";
    if (confidence >= 70) return "text-warning";
    return "text-muted-foreground";
  };

  return (
    <Card className="glass">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">AI Insights</CardTitle>
                <Sparkles className="h-4 w-4 text-accent animate-pulse" />
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Automated analysis & recommendations
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[350px] pr-4">
          <div className="space-y-3">
            {insights.map((insight) => {
              const styles = getTypeStyles(insight.type);
              const Icon = styles.icon;
              
              return (
                <div
                  key={insight.id}
                  className={`p-4 rounded-lg ${styles.bg} border ${styles.border} transition-all hover:scale-[1.01] cursor-pointer group`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${styles.bg}`}>
                      <Icon className={`h-4 w-4 ${styles.text}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-medium text-sm">{insight.title}</h4>
                        <Badge variant="outline" className="shrink-0 text-xs">
                          {styles.label}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {insight.summary}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <div className={`h-2 w-2 rounded-full ${
                              insight.confidence >= 85 ? "bg-success" :
                              insight.confidence >= 70 ? "bg-warning" : "bg-muted"
                            }`} />
                            <span className={`text-xs font-medium ${getConfidenceColor(insight.confidence)}`}>
                              {insight.confidence}% confidence
                            </span>
                          </div>
                          
                          {insight.relatedKpiIds.length > 0 && (
                            <div className="flex gap-1">
                              {insight.relatedKpiIds.slice(0, 2).map((kpiId) => (
                                <Badge key={kpiId} variant="secondary" className="text-xs py-0">
                                  KPI
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
