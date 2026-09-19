"use client";

import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { JobApplication, JobStage, JOB_STAGES, STAGE_COLORS } from "@/types/job";
import { JobCard } from "./job-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, GripVertical } from "lucide-react";

interface KanbanColumnProps {
  stage: JobStage;
  jobs: JobApplication[];
  allJobs: JobApplication[];
  onJobUpdate: (job: JobApplication) => void;
  onJobDelete: (jobId: string) => void;
  onStageChange: (jobId: string, newStage: JobStage) => void;
  onEditClick: (job: JobApplication) => void;
}

export function KanbanColumn({ stage, jobs, onJobUpdate, onJobDelete, onStageChange, onEditClick }: KanbanColumnProps) {
  const stageInfo = JOB_STAGES[stage];
  const stageColor = STAGE_COLORS[stage];

  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[300px] max-w-[340px] bg-gray-50 rounded-xl border ${
        isOver ? "border-primary/50 bg-primary/5" : "border-gray-200"
      } transition-colors`}
    >
      <div className="p-4 border-b bg-white rounded-t-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-8 rounded-full ${stageColor}`} />
            <h3 className="font-semibold text-gray-900">{stageInfo.label}</h3>
          </div>
          <Badge variant="secondary" className="text-xs">
            {jobs.length}
          </Badge>
        </div>
        <p className="text-xs text-gray-500">{stageInfo.description}</p>
      </div>

      <div
        className="p-3 space-y-3 min-h-[400px]"
        style={{ minHeight: "400px" }}
      >
        {jobs.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <GripVertical className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Drag jobs here or click "Add Job"</p>
          </div>
        ) : (
          jobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onUpdate={onJobUpdate}
              onDelete={onJobDelete}
              onStageChange={onStageChange}
              onEditClick={onEditClick}
            />
          ))
        )}
      </div>

      <div className="p-3 border-t bg-white/50 rounded-b-xl">
        <button
          className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors py-2"
          onClick={() => onEditClick({
            id: crypto.randomUUID(),
            userId: "current-user",
            companyName: "",
            jobTitle: "",
            jobUrl: "",
            stage,
            priority: "medium",
            isArchived: false,
            isTrashed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as JobApplication)}
        >
          <Plus className="w-4 h-4" />
          Add to {stageInfo.label}
        </button>
      </div>
    </div>
  );
}