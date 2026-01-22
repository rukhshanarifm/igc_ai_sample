import { FileText, TrendingUp, Activity, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardStats } from "@/types/dashboard";

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Articles",
      value: stats.totalArticles.toLocaleString(),
      subtitle: "in database",
      icon: FileText,
      color: "primary",
    },
    {
      title: "Today's Articles",
      value: stats.articlesToday.toString(),
      subtitle: "processed today",
      icon: TrendingUp,
      color: "accent",
    },
    {
      title: "Sentiment Score",
      value: `${Math.round(stats.avgSentiment * 100)}%`,
      subtitle: "positive coverage",
      icon: Activity,
      color: "success",
    },
    {
      title: "Active KPIs",
      value: stats.activeKPIs.toString(),
      subtitle: "being tracked",
      icon: BarChart3,
      color: "warning",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; iconBg: string }> = {
      primary: { bg: "bg-primary/10", text: "text-primary", iconBg: "bg-primary/20" },
      accent: { bg: "bg-accent/10", text: "text-accent", iconBg: "bg-accent/20" },
      success: { bg: "bg-success/10", text: "text-success", iconBg: "bg-success/20" },
      warning: { bg: "bg-warning/10", text: "text-warning", iconBg: "bg-warning/20" },
    };
    return colors[color] || colors.primary;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const colors = getColorClasses(card.color);
        const Icon = card.icon;
        return (
          <Card key={card.title} className="glass hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-3xl font-bold tracking-tight">{card.value}</p>
                  <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                </div>
                <div className={`p-3 rounded-xl ${colors.iconBg}`}>
                  <Icon className={`h-5 w-5 ${colors.text}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
