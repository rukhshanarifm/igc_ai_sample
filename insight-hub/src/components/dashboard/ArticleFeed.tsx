import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArticleCard } from "./ArticleCard";
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import type { ArticleSummary } from "@/types/dashboard";

interface ArticleFeedProps {
  articles: ArticleSummary[];
  bookmarkedIds: string[];
  onToggleBookmark: (articleId: string) => void;
}

const ARTICLES_PER_PAGE = 9;

export function ArticleFeed({ articles, bookmarkedIds, onToggleBookmark }: ArticleFeedProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Debug logging - TEMPORARY
  console.log('=== ARTICLE FEED DEBUG ===');
  console.log('Total articles received:', articles?.length || 0);

  const { positiveArticles, negativeArticles, neutralArticles } = useMemo(() => {
    const positive = articles.filter((a) => a.sentiment === "positive");
    const negative = articles.filter((a) => a.sentiment === "negative");
    const neutral = articles.filter((a) => a.sentiment === "neutral");

    console.log('Filtered articles:', {
      positive: positive.length,
      negative: negative.length,
      neutral: neutral.length
    });

    return {
      positiveArticles: positive,
      negativeArticles: negative,
      neutralArticles: neutral,
    };
  }, [articles]);

  const handleTabChange = () => {
    setCurrentPage(1);
  };

  const renderArticles = (list: ArticleSummary[]) => {
    if (list.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <p>No articles found matching the current filters.</p>
        </div>
      );
    }

    const totalPages = Math.ceil(list.length / ARTICLES_PER_PAGE);
    const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
    const endIndex = startIndex + ARTICLES_PER_PAGE;
    const paginatedList = list.slice(startIndex, endIndex);

    return (
      <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paginatedList.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              isBookmarked={bookmarkedIds.includes(article.id)}
              onToggleBookmark={onToggleBookmark}
            />
          ))}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, list.length)} of {list.length} articles
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <Card className="glass">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Latest Articles</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              AI-summarized news from today's newspapers
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="all">All ({articles.length})</TabsTrigger>
            <TabsTrigger value="positive" className="data-[state=active]:text-success">
              Positive ({positiveArticles.length})
            </TabsTrigger>
            <TabsTrigger value="negative" className="data-[state=active]:text-destructive">
              Negative ({negativeArticles.length})
            </TabsTrigger>
            <TabsTrigger value="neutral">
              Neutral ({neutralArticles.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            {renderArticles(articles)}
          </TabsContent>

          <TabsContent value="positive" className="mt-0">
            {renderArticles(positiveArticles)}
          </TabsContent>

          <TabsContent value="negative" className="mt-0">
            {renderArticles(negativeArticles)}
          </TabsContent>

          <TabsContent value="neutral" className="mt-0">
            {renderArticles(neutralArticles)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
