import { getJobApplications } from "@/actions/dashboard"
import { getInterviewHistory } from "@/actions/dashboard"
import PracticeInterviewPageClient from "./practice-interview-page"

export default async function PracticeInterviewPage() {
  const [jobs, history] = await Promise.all([
    getJobApplications(),
    getInterviewHistory(),
  ])

  return <PracticeInterviewPageClient initialJobs={jobs} initialHistory={history} />
}