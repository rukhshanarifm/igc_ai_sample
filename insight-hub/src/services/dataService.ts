/**
 * Data Service - Handles loading of processed data from JSON files
 * Provides caching and type-safe data access for the dashboard
 */

import type { ArticleSummary, KPI, AIInsight, Alert, DashboardStats } from '@/types/dashboard';

export interface TrendData {
  sentimentTrends: Array<{
    date: string;
    positive: number;
    negative: number;
    neutral: number;
  }>;
}

export interface InsightsData {
  insights: AIInsight[];
  alerts: Alert[];
}

/**
 * DataService class for loading and caching dashboard data
 */
export class DataService {
  private static articlesCache: ArticleSummary[] | null = null;
  private static kpisCache: KPI[] | null = null;
  private static trendsCache: TrendData | null = null;
  private static insightsCache: InsightsData | null = null;

  /**
   * Load all articles from JSON file
   */
  static async loadArticles(): Promise<ArticleSummary[]> {
    if (this.articlesCache) {
      return this.articlesCache;
    }

    try {
      const response = await fetch('/data/articles.json');
      if (!response.ok) {
        throw new Error(`Failed to load articles: ${response.statusText}`);
      }

      const data = await response.json();
      this.articlesCache = data.articles || [];
      return this.articlesCache;
    } catch (error) {
      console.error('Error loading articles:', error);
      // Return empty array on error to prevent crashes
      return [];
    }
  }

  /**
   * Load all KPIs from JSON file
   */
  static async loadKPIs(): Promise<KPI[]> {
    if (this.kpisCache) {
      return this.kpisCache;
    }

    try {
      const response = await fetch('/data/kpis.json');
      if (!response.ok) {
        throw new Error(`Failed to load KPIs: ${response.statusText}`);
      }

      const data = await response.json();
      this.kpisCache = data.kpis || [];
      return this.kpisCache;
    } catch (error) {
      console.error('Error loading KPIs:', error);
      return [];
    }
  }

  /**
   * Load trend data from JSON file
   */
  static async loadTrends(): Promise<TrendData> {
    if (this.trendsCache) {
      return this.trendsCache;
    }

    try {
      const response = await fetch('/data/trends.json');
      if (!response.ok) {
        throw new Error(`Failed to load trends: ${response.statusText}`);
      }

      const data = await response.json();
      this.trendsCache = data;
      return this.trendsCache;
    } catch (error) {
      console.error('Error loading trends:', error);
      return {
        sentimentTrends: []
      };
    }
  }

  /**
   * Load insights and alerts from JSON file
   */
  static async loadInsights(): Promise<InsightsData> {
    if (this.insightsCache) {
      return this.insightsCache;
    }

    try {
      const response = await fetch('/data/insights.json');
      if (!response.ok) {
        throw new Error(`Failed to load insights: ${response.statusText}`);
      }

      const data = await response.json();
      this.insightsCache = {
        insights: data.insights || [],
        alerts: data.alerts || []
      };
      return this.insightsCache;
    } catch (error) {
      console.error('Error loading insights:', error);
      return {
        insights: [],
        alerts: []
      };
    }
  }

  /**
   * Calculate dashboard statistics from loaded data
   */
  static async loadStats(): Promise<DashboardStats> {
    try {
      const articles = await DataService.loadArticles();
      const kpis = await DataService.loadKPIs();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const articlesToday = articles.filter(article => {
        const publishedDate = new Date(article.publishedAt);
        publishedDate.setHours(0, 0, 0, 0);
        return publishedDate.getTime() === today.getTime();
      }).length;

      // Calculate average sentiment (-1 to 1 scale)
      const avgSentiment = articles.length > 0
        ? articles.reduce((sum, a) => sum + a.sentimentScore, 0) / articles.length
        : 0;

      return {
        totalArticles: articles.length,
        articlesToday,
        avgSentiment,
        activeKPIs: kpis.length
      };
    } catch (error) {
      console.error('Error calculating stats:', error);
      return {
        totalArticles: 0,
        articlesToday: 0,
        avgSentiment: 0,
        activeKPIs: 0
      };
    }
  }

  /**
   * Clear all caches (useful for refreshing data)
   */
  static clearCache(): void {
    DataService.articlesCache = null;
    DataService.kpisCache = null;
    DataService.trendsCache = null;
    DataService.insightsCache = null;
  }

  /**
   * Refresh all data (clears cache and reloads)
   */
  static async refresh(): Promise<void> {
    DataService.clearCache();
    await Promise.all([
      DataService.loadArticles(),
      DataService.loadKPIs(),
      DataService.loadTrends(),
      DataService.loadInsights()
    ]);
  }
}
