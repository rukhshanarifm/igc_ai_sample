export type Sentiment = "positive" | "negative" | "neutral";
export type TrendDirection = "up" | "down" | "stable";
export type AlertSeverity = "critical" | "warning" | "info";
export type AlertStatus = "new" | "acknowledged" | "resolved";

export interface KPI {
  id: string;
  name: string;
  description: string;
  category: string;
  keywords?: string[];
  currentScore: number;
  previousScore: number;
  trend: TrendDirection;
  articleCount: number;
  lastUpdated: string;
  historicalData?: Array<{
    date: string;
    score: number;
    articleCount: number;
  }>;
}

export interface ArticleSummary {
  id: string;
  title: string;
  source: string;
  category: 'power' | 'tax';
  publishedAt: string;
  summary: string;
  fullText?: string;
  sentiment: Sentiment;
  sentimentScore: number;
  kpiIds: string[];
  kpiRelevance: Record<string, number>;
  url: string;
  author?: string;
  imageUrl?: string;
  isBookmarked?: boolean;
  credibilityScore?: number;
  extractedTerms?: string[];
  topicCluster?: number;
}

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  publishedAt: string;
  summary: string;
  kpiIds: string[];
  source: string;
  doi?: string;
}

export interface DashboardStats {
  totalArticles: number;
  articlesToday: number;
  avgSentiment: number;
  activeKPIs: number;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  kpiId?: string;
  createdAt: string;
  source?: string;
}

export interface AIInsight {
  id: string;
  title: string;
  summary: string;
  type: "trend" | "anomaly" | "recommendation" | "risk";
  confidence: number;
  relatedKpiIds: string[];
  createdAt: string;
}

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}
