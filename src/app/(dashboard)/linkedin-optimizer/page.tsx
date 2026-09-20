import { getLinkedInOptimization } from "@/actions/dashboard"
import LinkedInOptimizerPageClient from "./linkedin-optimizer-page"

export const dynamic = 'force-dynamic'

export default async function LinkedInOptimizerPage() {
  const optimization = await getLinkedInOptimization()
  return <LinkedInOptimizerPageClient initialOptimization={optimization} />
}