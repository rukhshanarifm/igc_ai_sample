/**
 * ArticleDetailModal Component
 * Displays full article details including:
 * - Complete article text with KPI term highlighting
 * - Sentiment analysis breakdown
 * - Related articles from same topic cluster
 * - Share and export options
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
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ExternalLink,
  Copy,
  Share2,
  TrendingUp,
  TrendingDown,
  Minus,
  User,
  Calendar,
  Tag,
} from "lucide-react";
import type { ArticleSummary, KPI } from "@/types/dashboard";
import { toast } from "sonner";

interface ArticleDetailModalProps {
  article: ArticleSummary | null;
  articles: ArticleSummary[];
  kpis: KPI[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ArticleDetailModal({
  article,
  articles,
  kpis,
  open,
  onOpenChange,
}: ArticleDetailModalProps) {
  // Find related articles from same topic cluster
  const relatedArticles = useMemo(() => {
    if (!article || article.topicCluster === undefined) return [];

    return articles
      .filter(
        (a) =>
          a.id !== article.id &&
          a.topicCluster === article.topicCluster
      )
      .slice(0, 5);
  }, [article, articles]);

  // Get KPI details for this article
  const articleKPIs = useMemo(() => {
    if (!article) return [];

    return kpis.filter((kpi) => article.kpiIds.includes(kpi.id));
  }, [article, kpis]);

  // Highlight KPI terms in text
  const highlightedText = useMemo(() => {
    if (!article?.fullText) return "";

    let text = article.fullText;
    const terms = article.extractedTerms || [];

    // Simple highlighting - wrap terms in spans
    terms.forEach((term) => {
      const regex = new RegExp(`(${term})`, "gi");
      text = text.replace(regex, `<mark class="bg-primary/20 px-1 rounded">$1</mark>`);
    });

    return text;
  }, [article]);

  if (!article) return null;

  const getSentimentIcon = () => {
    switch (article.sentiment) {
      case "positive":
        return <TrendingUp className="h-5 w-5 text-success" />;
      case "negative":
        return <TrendingDown className="h-5 w-5 text-destructive" />;
      default:
        return <Minus className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getSentimentColor = () => {
    switch (article.sentiment) {
      case "positive":
        return "text-success";
      case "negative":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(article.url);
    toast.success("Link copied to clipboard");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: article.url,
      });
    } else {
      handleCopyLink();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl leading-tight mb-2">
                {article.title}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline">{article.source}</Badge>
                <Badge variant="secondary">{article.category}</Badge>
                <span className="flex items-center gap-1 text-xs">
                  <Calendar className="h-3 w-3" />
                  {new Date(article.publishedAt).toLocaleDateString()}
                </span>
                {article.author && (
                  <span className="flex items-center gap-1 text-xs">
                    <User className="h-3 w-3" />
                    {article.author}
                  </span>
                )}
              </DialogDescription>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="icon" onClick={handleCopyLink}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Sentiment & Metadata */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                    {getSentimentIcon()}
                    Sentiment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold capitalize ${getSentimentColor()}`}>
                    {article.sentiment}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Score: {((article.sentimentScore + 1) / 2 * 100).toFixed(0)}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">Credibility</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{article.credibilityScore}%</div>
                  <p className="text-sm text-muted-foreground">Source reliability</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">Topic Cluster</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {article.topicCluster !== undefined ? `#${article.topicCluster}` : "N/A"}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {relatedArticles.length} related articles
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* KPIs */}
            {articleKPIs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Related KPIs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {articleKPIs.map((kpi) => (
                      <div
                        key={kpi.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{kpi.name}</p>
                          <p className="text-xs text-muted-foreground">{kpi.category}</p>
                        </div>
                        <Badge variant="secondary">
                          {article.kpiRelevance?.[kpi.id]?.toFixed(0)}% match
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{article.summary}</p>
              </CardContent>
            </Card>

            {/* Full Article Text */}
            {article.fullText && (
              <Card>
                <CardHeader>
                  <CardTitle>Full Article</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: highlightedText }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Extracted Terms */}
            {article.extractedTerms && article.extractedTerms.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Key Terms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {article.extractedTerms.map((term, idx) => (
                      <Badge key={idx} variant="outline">
                        {term}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Related Articles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {relatedArticles.map((relatedArticle) => (
                      <div
                        key={relatedArticle.id}
                        className="border-l-2 border-primary/30 pl-4 py-2"
                      >
                        <h4 className="font-medium leading-snug mb-1">
                          {relatedArticle.title}
                        </h4>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {relatedArticle.source}
                          </Badge>
                          <Badge
                            variant={
                              relatedArticle.sentiment === "positive"
                                ? "default"
                                : relatedArticle.sentiment === "negative"
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {relatedArticle.sentiment}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(relatedArticle.publishedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
