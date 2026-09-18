import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ResumeBuilderPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Resume Builder</h1>
          <p className="text-gray-500">Create ATS-optimized resumes with AI</p>
        </div>
        <Button>Build Resume</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resume Builder - Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">AI-powered resume generation with Gemini integration will be implemented here.</p>
          <p className="text-sm text-gray-400 mt-2">Features: AI generation, live preview, template selection, PDF export</p>
        </CardContent>
      </Card>
    </div>
  )
}