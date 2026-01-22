import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bookmark, ExternalLink, X, Clock } from "lucide-react";
import type { ArticleSummary } from "@/types/dashboard";

interface BookmarkedArticlesProps {
  articles: ArticleSummary[];
  onRemoveBookmark: (articleId: string) => void;
}

export function BookmarkedArticles({ articles, onRemoveBookmark }: BookmarkedArticlesProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getSentimentStyles = (sentiment: ArticleSummary["sentiment"]) => {
    switch (sentiment) {
      case "positive":
        return "bg-success/10 text-success border-success/20";
      case "negative":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <Card className="glass">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Bookmark className="h-5 w-5 text-warning" />
            </div>
            <div>
              <CardTitle className="text-lg">Reading List</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {articles.length} saved articles
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[250px] pr-4">
          <div className="space-y-3">
            {articles.map((article) => (
              <div
                key={article.id}
                className="p-3 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/30 transition-colors group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onRemoveBookmark(article.id)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs py-0">
                      {article.source}
                    </Badge>
                    <Badge className={`border text-xs py-0 ${getSentimentStyles(article.sentiment)}`}>
                      {article.sentiment}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatTime(article.publishedAt)}
                  </div>
                </div>
              </div>
            ))}
            
            {articles.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Bookmark className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No bookmarked articles</p>
                <p className="text-xs mt-1">Click the bookmark icon on articles to save them</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
