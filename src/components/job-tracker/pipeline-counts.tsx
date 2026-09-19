"use client";

import { JobApplication, JOB_STAGES, JobStage } from "@/types/job";
import { Badge } from "@/components/ui/badge";
import { STAGE_COLORS } from "@/types/job";

interface PipelineCountsProps {
  jobs: JobApplication[];
}

export function PipelineCounts({ jobs }: PipelineCountsProps) {
  const stageOrder: JobStage[] = [
    "bookmarked", "applying", "applied", "interviewing",
    "negotiating", "accepted", "rejected", "archived"
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {stageOrder.map(stage => {
        const count = jobs.filter(j => j.stage === stage).length;
        const color = STAGE_COLORS[stage];
        if (count === 0) return null;
        return (
          <Badge key={stage} variant="outline" className={`${color} whitespace-nowrap`}>
            {JOB_STAGES[stage].label} <span className="ml-1">{count}</span>
          </Badge>
        );
      })}
    </div>
  );
}