import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/dashboard/Header";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { KPIOverview } from "@/components/dashboard/KPIOverview";
import { ArticleFeed } from "@/components/dashboard/ArticleFeed";
import { SentimentChart } from "@/components/dashboard/SentimentChart";
import { ResearchSection } from "@/components/dashboard/ResearchSection";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { AIInsightsPanel } from "@/components/dashboard/AIInsightsPanel";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KPIDetailModal } from "@/components/dashboard/KPIDetailModal";
import { ArticleDetailModal } from "@/components/dashboard/ArticleDetailModal";
import { KPITrendChart } from "@/components/dashboard/KPITrendChart";
import { ExportDialog } from "@/components/dashboard/ExportDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, TrendingUp } from "lucide-react";
import { DataService } from "@/services/dataService";
import { mockResearchPapers } from "@/data/mockData";
import type { DateRange, KPI as KPIType, ArticleSummary } from "@/types/dashboard";
import { toast } from "sonner";

const Index = () => {
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedKPIs, setSelectedKPIs] = useState<string[]>([]);

  // Bookmark state
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  // Modal states
  const [selectedKPI, setSelectedKPI] = useState<KPIType | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<ArticleSummary | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showTrendsChart, setShowTrendsChart] = useState(false);

  // Load data using React Query
  const { data: articles = [], isLoading: articlesLoading, error: articlesError } = useQuery({
    queryKey: ['articles'],
    queryFn: DataService.loadArticles,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: kpis = [], isLoading: kpisLoading } = useQuery({
    queryKey: ['kpis'],
    queryFn: DataService.loadKPIs,
    staleTime: 5 * 60 * 1000,
  });

  const { data: trendsData, isLoading: trendsLoading, error: trendsError } = useQuery({
    queryKey: ['trends'],
    queryFn: DataService.loadTrends,
    staleTime: 5 * 60 * 1000,
  });

  const { data: insightsData, isLoading: insightsLoading } = useQuery({
    queryKey: ['insights'],
    queryFn: DataService.loadInsights,
    staleTime: 5 * 60 * 1000,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: DataService.loadStats,
    staleTime: 5 * 60 * 1000,
  });

  // Debug logging - TEMPORARY
  console.log('=== DASHBOARD DEBUG ===');
  console.log('Articles loaded:', articles?.length || 0);
  console.log('Trends data:', trendsData);
  console.log('Loading states:', { articlesLoading, trendsLoading });
  console.log('Errors:', { articlesError, trendsError });

  // Alert state (from loaded data)
  const [alerts, setAlerts] = useState(insightsData?.alerts || []);

  // Update alerts when data loads
  useMemo(() => {
    if (insightsData?.alerts) {
      setAlerts(insightsData.alerts);
    }
  }, [insightsData]);

  // Filter articles based on search and filters
  const filteredArticles = useMemo(() => {
    // Early return if no filters applied
    if (!searchQuery && selectedSources.length === 0 && selectedKPIs.length === 0 && !dateRange.from) {
      return articles;
    }

    const query = searchQuery ? searchQuery.toLowerCase() : '';
    const hasSourceFilter = selectedSources.length > 0;
    const hasKPIFilter = selectedKPIs.length > 0;
    const hasDateFilter = !!dateRange.from;

    return articles.filter((article) => {
      // Search filter - check all at once
      if (query) {
        const titleMatch = article.title.toLowerCase().includes(query);
        const summaryMatch = article.summary.toLowerCase().includes(query);
        const sourceMatch = article.source.toLowerCase().includes(query);
        if (!titleMatch && !summaryMatch && !sourceMatch) return false;
      }

      // Source filter
      if (hasSourceFilter && !selectedSources.includes(article.source)) {
        return false;
      }

      // KPI filter
      if (hasKPIFilter) {
        const hasMatchingKPI = article.kpiIds.some((id) => selectedKPIs.includes(id));
        if (!hasMatchingKPI) return false;
      }

      // Date filter
      if (hasDateFilter) {
        const articleDate = new Date(article.publishedAt);
        if (articleDate < dateRange.from!) return false;
        if (dateRange.to && articleDate > dateRange.to) return false;
      }

      return true;
    });
  }, [articles, searchQuery, selectedSources, selectedKPIs, dateRange]);

  const handleToggleBookmark = (articleId: string) => {
    setBookmarkedIds((prev) => {
      const isBookmarked = prev.includes(articleId);
      if (isBookmarked) {
        toast.info("Removed from reading list");
        return prev.filter((id) => id !== articleId);
      } else {
        toast.success("Added to reading list");
        return [...prev, articleId];
      }
    });
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, status: "acknowledged" as const } : alert
      )
    );
    toast.success("Alert acknowledged");
  };

  const handleDismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
    toast.info("Alert dismissed");
  };

  const handleRefresh = async () => {
    try {
      await DataService.refresh();
      // Invalidate React Query cache to refetch
      window.location.reload();
      toast.success("Data refreshed", {
        description: "Latest articles and KPI data loaded.",
      });
    } catch (error) {
      toast.error("Failed to refresh data", {
        description: "Please try again later.",
      });
    }
  };

  // Loading state - show partial UI while loading
  const isLoading = articlesLoading || kpisLoading || trendsLoading || insightsLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground mb-2">Loading dashboard data...</p>
          <p className="text-xs text-muted-foreground/70">
            {articlesLoading && "Loading articles... "}
            {kpisLoading && "Loading KPIs... "}
            {trendsLoading && "Loading trends... "}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-6 py-6 space-y-6">
        {/* Last Modified Date */}
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleString('en-PK', { 
              dateStyle: 'full', 
              timeStyle: 'short',
              timeZone: 'Asia/Karachi'
            })}
          </p>
        </div>

        {/* Stats Overview */}
        {stats && <StatsCards stats={stats} />}

        {/* Filter Bar */}
        <FilterBar
          kpis={kpis}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          selectedSources={selectedSources}
          onSourcesChange={setSelectedSources}
          selectedKPIs={selectedKPIs}
          onKPIsChange={setSelectedKPIs}
          onRefresh={handleRefresh}
        />

        {/* Main Content Tabs */}
        <Tabs defaultValue="articles" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="articles">Latest Articles</TabsTrigger>
            <TabsTrigger value="research">Research Papers</TabsTrigger>
          </TabsList>

          <TabsContent value="articles">
            <ArticleFeed
              articles={filteredArticles}
              bookmarkedIds={bookmarkedIds}
              onToggleBookmark={handleToggleBookmark}
            />
          </TabsContent>

          <TabsContent value="research">
            <ResearchSection papers={mockResearchPapers} />
          </TabsContent>
        </Tabs>

        {/* Sentiment Trends */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {trendsData?.sentimentTrends && trendsData.sentimentTrends.length > 0 ? (
              <SentimentChart data={trendsData.sentimentTrends} />
            ) : (
              <Card className="glass">
                <CardContent className="p-6 text-center text-muted-foreground">
                  <p>No sentiment trend data available</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <QuickActions />
          </div>
        </div>

        {/* AI Insights & Alerts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {insightsData && <AIInsightsPanel insights={insightsData.insights} />}
          <AlertsPanel
            alerts={alerts}
            onAcknowledge={handleAcknowledgeAlert}
            onDismiss={handleDismissAlert}
          />
        </div>

        {/* KPI Performance - Bottom */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">KPI Performance</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Performance scores (0-100) track trends across policy areas. Higher scores indicate more positive coverage and outcomes.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowTrendsChart(!showTrendsChart)}>
                <TrendingUp className="h-4 w-4 mr-2" />
                {showTrendsChart ? "Hide" : "Show"} Trends
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowExportDialog(true)}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {showTrendsChart && <KPITrendChart kpis={kpis} />}

          <KPIOverview kpis={kpis} onKPIClick={setSelectedKPI} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-12">
        <div className="container px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2026 Prime Minister's Office, Pakistan. Intelligence Dashboard.</p>
            <p className="font-mono text-xs">
              Last data sync: {new Date().toLocaleTimeString()} PKT
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <KPIDetailModal
        kpi={selectedKPI}
        articles={articles}
        open={!!selectedKPI}
        onOpenChange={(open) => !open && setSelectedKPI(null)}
      />

      <ArticleDetailModal
        article={selectedArticle}
        articles={articles}
        kpis={kpis}
        open={!!selectedArticle}
        onOpenChange={(open) => !open && setSelectedArticle(null)}
      />

      <ExportDialog
        articles={filteredArticles}
        kpis={kpis}
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
      />
    </div>
  );
};

export default Index;
