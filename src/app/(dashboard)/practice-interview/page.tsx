import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function PracticeInterviewPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Practice Interview</h1>
          <p className="text-gray-500">AI-powered mock interviews with real-time feedback</p>
        </div>
        <Button>Start Interview</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Interview Practice - Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Mock interview system with speech recognition and AI feedback will be implemented here.</p>
          <p className="text-sm text-gray-400 mt-2">Features: JD/CV formatting, chat-based interview, feedback & scoring, history</p>
        </CardContent>
      </Card>
    </div>
  )
}