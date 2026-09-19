"use client";

import { useState, useCallback } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanColumn } from "./kanban-column";
import { AddJobModal } from "./add-job-modal";
import { FilterBar } from "./filter-bar";
import { PipelineCounts } from "./pipeline-counts";
import { JobApplication, JobStage, JOB_STAGES } from "@/types/job";
import { Button } from "@/components/ui/button";
import { Plus, Filter, ChevronDown } from "lucide-react";

const STAGE_ORDER: JobStage[] = [
  "bookmarked",
  "applying",
  "applied",
  "interviewing",
  "negotiating",
  "accepted",
  "rejected",
  "archived"
];

export function KanbanBoard({ initialJobs = [] }: { initialJobs: JobApplication[] }) {
  const [jobs, setJobs] = useState<JobApplication[]>(initialJobs);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState<{ stage?: JobStage; search?: string; sort?: string }>({});
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const filteredJobs = jobs.filter(job => {
    if (filters.stage && job.stage !== filters.stage) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      if (!job.companyName.toLowerCase().includes(search) &&
          !job.jobTitle.toLowerCase().includes(search)) return false;
    }
    return true;
  });

  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeJob = jobs.find(j => j.id === active.id);
    const overJob = jobs.find(j => j.id === over.id);
    if (!activeJob || !overJob) return;

    const activeStage = activeJob.stage;
    const overStage = overJob.stage;

    if (activeStage === overStage) {
      const stageJobs = jobs.filter(j => j.stage === activeStage);
      const oldIndex = stageJobs.findIndex(j => j.id === active.id);
      const newIndex = stageJobs.findIndex(j => j.id === over.id);
      const reordered = arrayMove(stageJobs, oldIndex, newIndex);
      setJobs(prev => prev.map(j => {
        if (j.stage !== activeStage) return j;
        const reorderedJob = reordered.find(r => r.id === j.id);
        return reorderedJob || j;
      }));
    } else {
      setJobs(prev => prev.map(j => {
        if (j.id === active.id) return { ...j, stage: overStage, updatedAt: new Date().toISOString() };
        return j;
      }));
    }
  }, [jobs]);

  const handleAddJob = (jobData: Partial<JobApplication>) => {
    const newJob: JobApplication = {
      id: crypto.randomUUID(),
      userId: "current-user",
      ...jobData,
      stage: "bookmarked",
      priority: "medium",
      isArchived: false,
      isTrashed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as JobApplication;
    setJobs(prev => [newJob, ...prev]);
    setShowAddModal(false);
  };

  const handleUpdateJob = (updatedJob: JobApplication) => {
    setJobs(prev => prev.map(j => j.id === updatedJob.id ? { ...updatedJob, updatedAt: new Date().toISOString() } : j));
    setEditingJob(null);
  };

  const handleDeleteJob = (jobId: string) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
  };

  const handleStageChange = (jobId: string, newStage: JobStage) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, stage: newStage, updatedAt: new Date().toISOString() } : j));
  };

  const stageJobs = (stage: JobStage) => filteredJobs.filter(j => j.stage === stage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Tracker</h1>
          <p className="text-gray-500 mt-1">Track and manage your job applications</p>
        </div>
        <div className="flex items-center gap-3">
          <PipelineCounts jobs={jobs} />
          <Button variant="outline" size="sm" onClick={() => setFilters({...filters, stage: undefined})}>
            <Filter className="w-4 h-4 mr-1" />
            Filters
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Job
          </Button>
        </div>
      </div>

      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
        jobCount={filteredJobs.length}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={STAGE_ORDER}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
            {STAGE_ORDER.map(stage => (
              <KanbanColumn
                key={stage}
                stage={stage}
                jobs={stageJobs(stage)}
                allJobs={jobs}
                onJobUpdate={handleUpdateJob}
                onJobDelete={handleDeleteJob}
                onStageChange={handleStageChange}
                onEditClick={setEditingJob}
              />
            ))}
            <AddJobModal
              isOpen={showAddModal}
              onClose={() => setShowAddModal(false)}
              onSubmit={handleAddJob}
            />
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}