import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DateRangePicker } from "./DateRangePicker";
import { SourceFilter } from "./SourceFilter";
import { KPIFilter } from "./KPIFilter";
import { Search, X, RefreshCw } from "lucide-react";
import type { KPI, DateRange } from "@/types/dashboard";

interface FilterBarProps {
  kpis: KPI[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  selectedSources: string[];
  onSourcesChange: (sources: string[]) => void;
  selectedKPIs: string[];
  onKPIsChange: (kpiIds: string[]) => void;
  onRefresh: () => void;
}

export function FilterBar({
  kpis,
  searchQuery,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  selectedSources,
  onSourcesChange,
  selectedKPIs,
  onKPIsChange,
  onRefresh,
}: FilterBarProps) {
  const hasActiveFilters = selectedSources.length > 0 || selectedKPIs.length > 0 || searchQuery || dateRange.from;

  const handleClearAll = () => {
    onSearchChange("");
    onSourcesChange([]);
    onKPIsChange([]);
    onDateRangeChange({ from: undefined, to: undefined });
  };

  return (
    <div className="glass rounded-lg p-4 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles, topics..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-secondary/50 border-0"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => onSearchChange("")}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Date Range */}
        <DateRangePicker dateRange={dateRange} onDateRangeChange={onDateRangeChange} />

        {/* Source Filter */}
        <SourceFilter selectedSources={selectedSources} onSourcesChange={onSourcesChange} />

        {/* KPI Filter */}
        <KPIFilter kpis={kpis} selectedKPIs={selectedKPIs} onKPIsChange={onKPIsChange} />

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleClearAll}>
              <X className="h-4 w-4 mr-1" />
              Clear filters
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border/50">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: "{searchQuery}"
              <X className="h-3 w-3 cursor-pointer" onClick={() => onSearchChange("")} />
            </Badge>
          )}
          
          {dateRange.from && (
            <Badge variant="secondary" className="gap-1">
              Date range set
              <X className="h-3 w-3 cursor-pointer" onClick={() => onDateRangeChange({ from: undefined, to: undefined })} />
            </Badge>
          )}
          
          {selectedSources.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              {selectedSources.length} sources
              <X className="h-3 w-3 cursor-pointer" onClick={() => onSourcesChange([])} />
            </Badge>
          )}
          
          {selectedKPIs.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              {selectedKPIs.length} KPIs
              <X className="h-3 w-3 cursor-pointer" onClick={() => onKPIsChange([])} />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
