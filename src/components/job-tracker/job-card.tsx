"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { JobApplication, PRIORITY_COLORS, STAGE_COLORS } from "@/types/job";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, ExternalLink, Edit, Trash2, GripVertical } from "lucide-react";
import { useState } from "react";

interface JobCardProps {
  job: JobApplication;
  onUpdate: (job: JobApplication) => void;
  onDelete: (jobId: string) => void;
  onStageChange: (jobId: string, newStage: import("@/types/job").JobStage) => void;
  onEditClick: (job: JobApplication) => void;
}

export function JobCard({ job, onUpdate, onDelete, onStageChange, onEditClick }: JobCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const priorityColor = PRIORITY_COLORS[job.priority] || PRIORITY_COLORS.medium;
  const stageColor = STAGE_COLORS[job.stage] || STAGE_COLORS.bookmarked;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleClick = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement && e.target.closest("button")) return;
    onEditClick(job);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group cursor-pointer bg-white rounded-lg border shadow-sm hover:shadow-md transition-all ${
        isDragging ? "shadow-lg ring-2 ring-primary" : ""
      }`}
      onClick={handleClick}
    >
      <div {...attributes} {...listeners} className="absolute top-2 left-2 z-10 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          aria-label="Drag"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate">{job.companyName}</h4>
            <p className="text-sm text-gray-600 truncate">{job.jobTitle}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              aria-label="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {job.jobUrl && (
          <a
            href={job.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            View posting
          </a>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={`text-xs ${stageColor}`}>
            {job.stage.charAt(0).toUpperCase() + job.stage.slice(1)}
          </Badge>
          <Badge variant="outline" className={`text-xs ${priorityColor}`}>
            {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
          </Badge>
          {job.source && (
            <Badge variant="secondary" className="text-xs">
              {job.source}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
          <span>Added {formatDate(job.createdAt)}</span>
          {job.dateApplied && (
            <span className="text-primary">Applied {formatDate(job.dateApplied)}</span>
          )}
        </div>

        {showMenu && (
          <div className="absolute right-4 top-12 z-20 bg-white rounded-lg border shadow-lg py-1 min-w-[140px] animate-in fade-in-0 zoom-in-95">
            <button
              onClick={(e) => { e.stopPropagation(); onEditClick(job); setShowMenu(false); }}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onStageChange(job.id, "applied"); setShowMenu(false); }}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              Mark Applied
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(job.id); setShowMenu(false); }}
              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}