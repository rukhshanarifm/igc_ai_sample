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
  /**
   * Load all articles from JSON file
   * Note: Removed static caching - React Query handles caching for us
   */
  static async loadArticles(): Promise<ArticleSummary[]> {
    console.log('Fetching articles from /data/articles.json...');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('/data/articles.json', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`Failed to load articles: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Parsed JSON data:', { hasArticles: !!data.articles, articlesLength: data.articles?.length });

      const articles = data.articles || [];
      console.log(`✅ Loaded ${articles.length} articles successfully`);
      return articles;
    } catch (error) {
      console.error('❌ Error loading articles:', error);
      console.error('Error details:', { name: (error as Error).name, message: (error as Error).message });
      // Return empty array on error to prevent crashes
      return [];
    }
  }

  /**
   * Load all KPIs from JSON file
   */
  static async loadKPIs(): Promise<KPI[]> {
    try {
      const response = await fetch('/data/kpis.json');
      if (!response.ok) {
        throw new Error(`Failed to load KPIs: ${response.statusText}`);
      }

      const data = await response.json();
      return data.kpis || [];
    } catch (error) {
      console.error('Error loading KPIs:', error);
      return [];
    }
  }

  /**
   * Load trend data from JSON file
   */
  static async loadTrends(): Promise<TrendData> {
    try {
      const response = await fetch('/data/trends.json');
      if (!response.ok) {
        throw new Error(`Failed to load trends: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Loaded trends data:', data);
      return data;
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
    try {
      const response = await fetch('/data/insights.json');
      if (!response.ok) {
        throw new Error(`Failed to load insights: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        insights: data.insights || [],
        alerts: data.alerts || []
      };
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
   * Refresh all data (React Query handles caching)
   */
  static async refresh(): Promise<void> {
    // React Query will handle cache invalidation
    // This method is kept for compatibility but doesn't need to do anything
    console.log('Refresh requested - React Query will handle cache invalidation');
  }
}
