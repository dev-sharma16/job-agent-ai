import { getUserProfile } from "@/actions/dashboard"
import AccountPageClient from "./account-page-client"

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const profile = await getUserProfile()
  return <AccountPageClient initialProfile={profile} />
}