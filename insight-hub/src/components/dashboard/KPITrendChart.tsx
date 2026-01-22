/**
 * KPITrendChart Component
 * Displays historical trend data for selected KPIs
 * Features:
 * - Multi-line chart for comparing multiple KPIs
 * - Article volume bars
 * - Configurable time range
 * - Interactive tooltips
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import type { KPI } from "@/types/dashboard";

interface KPITrendChartProps {
  kpis: KPI[];
}

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
];

export function KPITrendChart({ kpis }: KPITrendChartProps) {
  const [selectedKPIs, setSelectedKPIs] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<"7d" | "14d" | "all">("all");

  // Filter KPIs with historical data
  const kpisWithHistory = useMemo(() => {
    return kpis.filter((kpi) => kpi.historicalData && kpi.historicalData.length > 0);
  }, [kpis]);

  // Initialize selection with first 2 KPIs
  useMemo(() => {
    if (selectedKPIs.length === 0 && kpisWithHistory.length > 0) {
      setSelectedKPIs(kpisWithHistory.slice(0, 2).map((k) => k.id));
    }
  }, [kpisWithHistory, selectedKPIs.length]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (selectedKPIs.length === 0) return [];

    // Get all unique dates across selected KPIs
    const allDates = new Set<string>();
    const selectedKPIData = kpisWithHistory.filter((kpi) =>
      selectedKPIs.includes(kpi.id)
    );

    selectedKPIData.forEach((kpi) => {
      kpi.historicalData?.forEach((point) => {
        allDates.add(point.date);
      });
    });

    // Sort dates
    const sortedDates = Array.from(allDates).sort();

    // Filter by time range
    let filteredDates = sortedDates;
    if (timeRange !== "all") {
      const days = timeRange === "7d" ? 7 : 14;
      filteredDates = sortedDates.slice(-days);
    }

    // Build chart data
    return filteredDates.map((date) => {
      const dataPoint: any = { date };

      selectedKPIData.forEach((kpi) => {
        const historyPoint = kpi.historicalData?.find((h) => h.date === date);
        dataPoint[kpi.id] = historyPoint?.score || null;
        dataPoint[`${kpi.id}_count`] = historyPoint?.articleCount || 0;
      });

      return dataPoint;
    });
  }, [kpisWithHistory, selectedKPIs, timeRange]);

  const handleToggleKPI = (kpiId: string) => {
    setSelectedKPIs((prev) => {
      if (prev.includes(kpiId)) {
        return prev.filter((id) => id !== kpiId);
      } else {
        // Limit to 4 KPIs for readability
        if (prev.length >= 4) {
          return [...prev.slice(1), kpiId];
        }
        return [...prev, kpiId];
      }
    });
  };

  const selectedKPIData = kpisWithHistory.filter((kpi) =>
    selectedKPIs.includes(kpi.id)
  );

  if (kpisWithHistory.length === 0) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            KPI Trends Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No historical data available yet. Process more articles to see trends.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              KPI Trends Over Time
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Compare historical performance across KPIs
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="14d">Last 14 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KPI Selection */}
        <div className="flex flex-wrap gap-2">
          {kpisWithHistory.map((kpi, idx) => {
            const isSelected = selectedKPIs.includes(kpi.id);
            const color = COLORS[selectedKPIs.indexOf(kpi.id) % COLORS.length];

            return (
              <Button
                key={kpi.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => handleToggleKPI(kpi.id)}
                style={
                  isSelected
                    ? {
                        backgroundColor: color,
                        borderColor: color,
                      }
                    : {}
                }
              >
                {kpi.name}
              </Button>
            );
          })}
        </div>

        {/* Chart */}
        {selectedKPIs.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
              <defs>
                {selectedKPIData.map((kpi, idx) => {
                  const color = COLORS[idx % COLORS.length];
                  return (
                    <linearGradient
                      key={kpi.id}
                      id={`gradient-${kpi.id}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  );
                })}
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) =>
                  new Date(date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
                className="text-xs"
              />
              <YAxis
                yAxisId="left"
                domain={[0, 100]}
                label={{ value: "Score", angle: -90, position: "insideLeft" }}
                className="text-xs"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: "Articles", angle: 90, position: "insideRight" }}
                className="text-xs"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value: any, name: string) => {
                  // Format tooltip values
                  if (name.endsWith("_count")) {
                    return [value, "Articles"];
                  }
                  const kpi = kpisWithHistory.find((k) => k.id === name);
                  return [
                    typeof value === "number" ? value.toFixed(1) : value,
                    kpi?.name || name,
                  ];
                }}
              />
              <Legend
                formatter={(value) => {
                  if (value.endsWith("_count")) return null;
                  const kpi = kpisWithHistory.find((k) => k.id === value);
                  return kpi?.name || value;
                }}
              />

              {/* Lines for each selected KPI */}
              {selectedKPIData.map((kpi, idx) => {
                const color = COLORS[idx % COLORS.length];
                return (
                  <Line
                    key={kpi.id}
                    yAxisId="left"
                    type="monotone"
                    dataKey={kpi.id}
                    stroke={color}
                    strokeWidth={2}
                    dot={{ fill: color, r: 4 }}
                    activeDot={{ r: 6 }}
                    name={kpi.name}
                  />
                );
              })}
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">Select KPIs to view trends</p>
          </div>
        )}

        {/* Legend Info */}
        {selectedKPIs.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            {selectedKPIData.map((kpi, idx) => {
              const color = COLORS[idx % COLORS.length];
              const latestData = kpi.historicalData?.[kpi.historicalData.length - 1];

              return (
                <div key={kpi.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm font-medium">{kpi.name}</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {latestData?.score.toFixed(1)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {latestData?.articleCount} articles
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
