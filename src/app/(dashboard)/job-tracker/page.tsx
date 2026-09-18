import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function JobTrackerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Tracker</h1>
          <p className="text-gray-500">Track and manage your job applications</p>
        </div>
        <Button>Add Job</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kanban Board - Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Job Tracker with drag-and-drop Kanban board will be implemented here.</p>
          <p className="text-sm text-gray-400 mt-2">Features: Bookmarked → Applying → Applied → Interviewing → Negotiating → Accepted/Rejected</p>
        </CardContent>
      </Card>
    </div>
  )
}