import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArticleCard } from "./ArticleCard";
import { RefreshCw } from "lucide-react";
import type { ArticleSummary } from "@/types/dashboard";

interface ArticleFeedProps {
  articles: ArticleSummary[];
  bookmarkedIds: string[];
  onToggleBookmark: (articleId: string) => void;
}

export function ArticleFeed({ articles, bookmarkedIds, onToggleBookmark }: ArticleFeedProps) {
  const positiveArticles = articles.filter((a) => a.sentiment === "positive");
  const negativeArticles = articles.filter((a) => a.sentiment === "negative");
  const neutralArticles = articles.filter((a) => a.sentiment === "neutral");

  const renderArticles = (list: ArticleSummary[]) => (
    <div className="grid gap-4 md:grid-cols-2">
      {list.map((article) => (
        <ArticleCard 
          key={article.id} 
          article={article} 
          isBookmarked={bookmarkedIds.includes(article.id)}
          onToggleBookmark={onToggleBookmark}
        />
      ))}
    </div>
  );

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
        <Tabs defaultValue="all" className="w-full">
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
