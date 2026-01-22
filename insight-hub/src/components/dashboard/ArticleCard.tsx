import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Shield
} from "lucide-react";
import type { ArticleSummary } from "@/types/dashboard";

interface ArticleCardProps {
  article: ArticleSummary;
  isBookmarked?: boolean;
  onToggleBookmark?: (articleId: string) => void;
}

export const ArticleCard = memo(function ArticleCard({ article, isBookmarked = false, onToggleBookmark }: ArticleCardProps) {
  const getSentimentStyles = () => {
    switch (article.sentiment) {
      case "positive":
        return "bg-success/10 text-success border-success/20";
      case "negative":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getCredibilityColor = (score?: number) => {
    if (!score) return "text-muted-foreground";
    if (score >= 90) return "text-success";
    if (score >= 80) return "text-warning";
    return "text-muted-foreground";
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <Card className="glass group hover:border-primary/30 transition-all">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="font-medium">
              {article.source}
            </Badge>
            <Badge className={`border ${getSentimentStyles()}`}>
              {article.sentiment}
            </Badge>
            {article.credibilityScore && (
              <div className={`flex items-center gap-1 text-xs ${getCredibilityColor(article.credibilityScore)}`}>
                <Shield className="h-3 w-3" />
                {article.credibilityScore}%
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <Clock className="h-3 w-3" />
              {formatTime(article.publishedAt)}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => onToggleBookmark?.(article.id)}
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-4 w-4 text-warning" />
              ) : (
                <Bookmark className="h-4 w-4 opacity-50 hover:opacity-100" />
              )}
            </Button>
          </div>
        </div>

        <h3 className="font-semibold leading-snug mb-3 group-hover:text-primary transition-colors">
          {article.title}
        </h3>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
          {article.summary}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex gap-1.5 flex-wrap">
            {article.kpiIds.slice(0, 2).map((kpiId, i) => (
              <Badge key={kpiId} variant="secondary" className="text-xs">
                KPI #{i + 1}
              </Badge>
            ))}
          </div>
          <a 
            href={article.url} 
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Read more
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
});
