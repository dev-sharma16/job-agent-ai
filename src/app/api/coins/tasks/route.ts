import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const EXTENSION_TASKS = {
  "save-job": { coins: 5, name: "Save a job" },
  "apply-job": { coins: 10, name: "Apply to a job" },
  "complete-profile": { coins: 20, name: "Complete profile" },
  "practice-interview": { coins: 15, name: "Practice interview" },
  "optimize-linkedin": { coins: 15, name: "Optimize LinkedIn" },
  "daily-login": { coins: 3, name: "Daily login" },
  "refer-friend": { coins: 50, name: "Refer a friend" },
} as const;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await req.json();

    if (!taskId || !EXTENSION_TASKS[taskId as keyof typeof EXTENSION_TASKS]) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.userTask.findFirst({
      where: { userId: session.user.id, taskId, createdAt: { gte: today } },
    });

    if (existing?.status === "completed") {
      return NextResponse.json({ alreadyCompleted: true });
    }

    const taskConfig = EXTENSION_TASKS[taskId as keyof typeof EXTENSION_TASKS];
    const coins = taskConfig.coins;

    await prisma.$transaction([
      prisma.userTask.upsert({
        where: { userId_taskId_createdAt: { userId: session.user.id, taskId, createdAt: today } },
        create: { userId: session.user.id, taskId, status: "completed", completedAt: new Date() },
        update: { status: "completed", completedAt: new Date() },
      }),
      prisma.userCoins.upsert({
        where: { userId: session.user.id },
        update: { coins: { increment: coins } },
        create: { userId: session.user.id, coins },
      }),
    ]);
    // Run streak check separately
    await checkAndAwardStreak(session.user.id);

    return NextResponse.json({ success: true, coins });
  } catch (error) {
    console.error("Task completion error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

async function checkAndAwardStreak(userId: string) {
  const streak = await prisma.userStreak.findUnique({ where: { userId } });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (streak) {
    const lastCompleted = streak.lastCompletedAt ? new Date(streak.lastCompletedAt) : null;
    
    if (lastCompleted) {
      lastCompleted.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((new Date(today).getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Consecutive day - increment streak
        await prisma.userStreak.update({
          where: { userId },
          data: {
            currentStreak: { increment: 1 },
            maxStreak: { increment: 1 },
            lastCompletedAt: today,
          },
        });
      } else if (diffDays > 1) {
        // Streak broken - reset to 1
        await prisma.userStreak.update({
          where: { userId },
          data: { currentStreak: 1, lastCompletedAt: today },
        });
      }
    } else {
      // First time
      await prisma.userStreak.update({
        where: { userId },
        data: { currentStreak: 1, maxStreak: { increment: 1 }, lastCompletedAt: today },
      });
    }
  } else {
    await prisma.userStreak.create({
      data: { userId, currentStreak: 1, maxStreak: 1, lastCompletedAt: today },
    });
  }
}