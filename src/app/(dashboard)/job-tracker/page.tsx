import { KanbanBoard } from "@/components/job-tracker/kanban-board";
import { getJobApplications } from "@/actions/dashboard";

export const dynamic = 'force-dynamic'

export default async function JobTrackerPage() {
  const jobs = await getJobApplications()
  return (
    <div className="space-y-6">
      <KanbanBoard initialJobs={jobs} />
    </div>
  )
}