import { getUserProfile } from "@/actions/dashboard"
import AccountPageClient from "./account-page"

export default async function AccountPage() {
  const profile = await getUserProfile()
  return <AccountPageClient initialProfile={profile} />
}