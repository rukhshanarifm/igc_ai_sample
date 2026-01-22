/**
 * KPIDetailModal Component
 * Displays detailed information about a specific KPI including:
 * - Historical trend chart
 * - Sentiment breakdown
 * - Top relevant articles
 * - Keyword information
 */

import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, ExternalLink } from "lucide-react";
import type { KPI, ArticleSummary } from "@/types/dashboard";

interface KPIDetailModalProps {
  kpi: KPI | null;
  articles: ArticleSummary[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KPIDetailModal({ kpi, articles, open, onOpenChange }: KPIDetailModalProps) {
  // Filter articles relevant to this KPI
  const relevantArticles = useMemo(() => {
    if (!kpi) return [];

    return articles
      .filter(article =>
        article.kpiRelevance?.[kpi.id] && article.kpiRelevance[kpi.id] > 30
      )
      .sort((a, b) => {
        const scoreA = a.kpiRelevance?.[kpi.id] || 0;
        const scoreB = b.kpiRelevance?.[kpi.id] || 0;
        return scoreB - scoreA;
      })
      .slice(0, 10);
  }, [kpi, articles]);

  // Calculate sentiment breakdown
  const sentimentData = useMemo(() => {
    if (!relevantArticles.length) return [];

    const counts = relevantArticles.reduce(
      (acc, article) => {
        acc[article.sentiment] = (acc[article.sentiment] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return [
      { name: 'Positive', value: counts.positive || 0, color: '#10b981' },
      { name: 'Neutral', value: counts.neutral || 0, color: '#6b7280' },
      { name: 'Negative', value: counts.negative || 0, color: '#ef4444' },
    ].filter(item => item.value > 0);
  }, [relevantArticles]);

  if (!kpi) return null;

  const getTrendIcon = () => {
    switch (kpi.trend) {
      case 'up':
        return <TrendingUp className="h-5 w-5 text-success" />;
      case 'down':
        return <TrendingDown className="h-5 w-5 text-destructive" />;
      default:
        return <Minus className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    switch (kpi.trend) {
      case 'up':
        return 'text-success';
      case 'down':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            {kpi.name}
            {getTrendIcon()}
          </DialogTitle>
          <DialogDescription>{kpi.description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            {/* KPI Score Overview */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">Current Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{kpi.currentScore.toFixed(1)}</div>
                  <p className={`text-sm ${getTrendColor()}`}>
                    {kpi.trend === 'up' && '+'}
                    {(kpi.currentScore - kpi.previousScore).toFixed(1)} from previous
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">Article Count</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{kpi.articleCount}</div>
                  <p className="text-sm text-muted-foreground">Total articles</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="text-base" variant="secondary">{kpi.category}</Badge>
                  <p className="text-sm text-muted-foreground mt-2">Last updated</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(kpi.lastUpdated).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Historical Trend Chart */}
            {kpi.historicalData && kpi.historicalData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Historical Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={kpi.historicalData}>
                      <defs>
                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        className="text-xs"
                      />
                      <YAxis className="text-xs" domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#3b82f6"
                        fillOpacity={1}
                        fill="url(#scoreGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Sentiment Breakdown */}
            {sentimentData.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Sentiment Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={sentimentData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {sentimentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Keywords</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {kpi.keywords?.map((keyword, idx) => (
                        <Badge key={idx} variant="outline">
                          {keyword}
                        </Badge>
                      ))}
                      {(!kpi.keywords || kpi.keywords.length === 0) && (
                        <p className="text-sm text-muted-foreground">No keywords available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Top Articles */}
            <Card>
              <CardHeader>
                <CardTitle>Top {relevantArticles.length} Relevant Articles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {relevantArticles.map((article) => (
                    <div
                      key={article.id}
                      className="border-l-4 border-primary/30 pl-4 py-2 hover:bg-muted/50 transition-colors rounded-r"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-medium leading-snug mb-2">{article.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {article.summary}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {article.source}
                            </Badge>
                            <Badge
                              variant={
                                article.sentiment === 'positive'
                                  ? 'default'
                                  : article.sentiment === 'negative'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                              className="text-xs"
                            >
                              {article.sentiment}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Relevance: {article.kpiRelevance?.[kpi.id]?.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 shrink-0"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                  {relevantArticles.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No relevant articles found for this KPI
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
