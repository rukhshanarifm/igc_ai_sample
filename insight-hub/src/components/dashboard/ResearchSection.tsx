import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Calendar, ExternalLink } from "lucide-react";
import type { ResearchPaper } from "@/types/dashboard";

interface ResearchSectionProps {
  papers: ResearchPaper[];
}

export function ResearchSection({ papers }: ResearchSectionProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="glass">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-3/10">
              <BookOpen className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <CardTitle className="text-lg">Research Papers</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Academic research linked to KPIs
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-chart-3/10 text-chart-3 border-chart-3/20">
            {papers.length} papers
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {papers.map((paper) => (
            <div
              key={paper.id}
              className="p-4 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <h4 className="font-medium leading-snug group-hover:text-primary transition-colors">
                  {paper.title}
                </h4>
                <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
              </div>

              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {paper.authors.join(", ")}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(paper.publishedAt)}
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                {paper.summary}
              </p>

              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {paper.source}
                </Badge>
                <div className="flex gap-1.5">
                  {paper.kpiIds.map((kpiId, i) => (
                    <Badge key={kpiId} variant="secondary" className="text-xs">
                      KPI #{i + 1}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {papers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Research paper pipeline coming soon</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
