import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, X } from "lucide-react";
import { sourceCredibility } from "@/data/mockData";

interface SourceFilterProps {
  selectedSources: string[];
  onSourcesChange: (sources: string[]) => void;
}

export function SourceFilter({ selectedSources, onSourcesChange }: SourceFilterProps) {
  const sources = Object.keys(sourceCredibility);

  const handleToggle = (source: string) => {
    if (selectedSources.includes(source)) {
      onSourcesChange(selectedSources.filter((s) => s !== source));
    } else {
      onSourcesChange([...selectedSources, source]);
    }
  };

  const handleClear = () => {
    onSourcesChange([]);
  };

  const handleSelectAll = () => {
    onSourcesChange(sources);
  };

  const getCredibilityColor = (score: number) => {
    if (score >= 90) return "bg-success";
    if (score >= 80) return "bg-warning";
    return "bg-muted";
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Sources
          {selectedSources.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
              {selectedSources.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Filter by Source</h4>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                All
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClear}>
                Clear
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            {sources.map((source) => (
              <div
                key={source}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 cursor-pointer"
                onClick={() => handleToggle(source)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedSources.includes(source)}
                    onCheckedChange={() => handleToggle(source)}
                  />
                  <span className="text-sm">{source}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${getCredibilityColor(sourceCredibility[source])}`} />
                  <span className="text-xs text-muted-foreground">
                    {sourceCredibility[source]}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-2 border-t text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-success" />
                <span>High (90+)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-warning" />
                <span>Medium</span>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
