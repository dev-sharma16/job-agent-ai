"use client";

import { JobStage, JOB_STAGES } from "@/types/job";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, X, Search } from "lucide-react";

interface FilterBarProps {
  filters: { stage?: JobStage; search?: string; sort?: string };
  onFiltersChange: (filters: { stage?: JobStage; search?: string; sort?: string }) => void;
  jobCount: number;
}

export function FilterBar({ filters, onFiltersChange, jobCount }: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg border">
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by company or title..."
          value={filters.search || ""}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-10"
        />
      </div>

      <Select value={filters.stage || ""} onValueChange={(v) => onFiltersChange({ ...filters, stage: v as JobStage | undefined })}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All stages" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Stages</SelectItem>
          {Object.entries(JOB_STAGES).map(([key, stage]) => (
            <SelectItem key={key} value={key as JobStage}>{stage.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.sort || ""} onValueChange={(v) => onFiltersChange({ ...filters, sort: v || undefined })}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt-desc">Newest First</SelectItem>
          <SelectItem value="createdAt-asc">Oldest First</SelectItem>
          <SelectItem value="companyName-asc">Company A-Z</SelectItem>
          <SelectItem value="companyName-desc">Company Z-A</SelectItem>
          <SelectItem value="priority-desc">Priority High-Low</SelectItem>
        </SelectContent>
      </Select>

      {(filters.stage || filters.search) && (
        <Button variant="ghost" size="sm" onClick={() => onFiltersChange({})} className="h-10">
          <X className="w-4 h-4 mr-1" />
          Clear Filters
        </Button>
      )}

      <div className="text-sm text-gray-500 sm:hidden">
        {jobCount} job{jobCount !== 1 ? "s" : ""} found
      </div>
    </div>
  );
}