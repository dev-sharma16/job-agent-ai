"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function getDashboardStats() {
  const session = await auth()
  if (!session?.user?.id) return null

  const [jobsCount, resumesCount, interviewsCount, coins, streak] = await Promise.all([
    prisma.jobApplication.count({ where: { userId: session.user.id, isTrashed: false, isArchived: false } }),
    prisma.resume.count({ where: { userId: session.user.id } }),
    prisma.interview.count({ where: { userId: session.user.id, completedAt: { not: null } } }),
    prisma.userCoins.findUnique({ where: { userId: session.user.id }, select: { coins: true } }),
    prisma.userStreak.findUnique({ where: { userId: session.user.id }, select: { currentStreak: true, maxStreak: true } }),
  ])

  return {
    jobsTracked: jobsCount,
    resumesCreated: resumesCount,
    interviewsPracticed: interviewsCount,
    coins: coins?.coins || 0,
    currentStreak: streak?.currentStreak || 0,
    maxStreak: streak?.maxStreak || 0,
  }
}

export async function getJobApplications() {
  const session = await auth()
  if (!session?.user?.id) return []

  return prisma.jobApplication.findMany({
    where: { userId: session.user.id, isTrashed: false, isArchived: false },
    include: { skills: true, formattedJD: true, interviews: true },
    orderBy: { updatedAt: "desc" },
  })
}

export async function getResumeData() {
  const session = await auth()
  if (!session?.user?.id) return null

  return prisma.resumeData.findUnique({
    where: { userId: session.user.id },
  })
}

export async function getInterviewHistory() {
  const session = await auth()
  if (!session?.user?.id) return []

  return prisma.interview.findMany({
    where: { userId: session.user.id, completedAt: { not: null } },
    include: { jobApplication: true },
    orderBy: { completedAt: "desc" },
  })
}

export async function getUserProfile() {
  const session = await auth()
  if (!session?.user?.id) return null

  return prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      coins: true,
      streak: true,
      premium: true,
      functionArea: true,
      accounts: { select: { provider: true, providerAccountId: true } },
    },
  })
}

export async function getLinkedInOptimization() {
  const session = await auth()
  if (!session?.user?.id) return null

  // Return latest optimization or null
  return null // Could add a model for this later
}