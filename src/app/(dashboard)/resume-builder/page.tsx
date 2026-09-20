import { getResumeData } from "@/actions/dashboard"
import ResumeBuilderPageClient from "./resume-builder-page"

export const dynamic = 'force-dynamic'

export default async function ResumeBuilderPage() {
  const resumeData = await getResumeData()
  return <ResumeBuilderPageClient initialResumeData={resumeData} />
}