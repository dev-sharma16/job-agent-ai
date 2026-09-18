import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyExtensionAuth } from '@/lib/extension-auth';

const EXTENSION_TASKS = {
  'save-job': { coins: 5, name: 'Save a job' },
  'apply-job': { coins: 10, name: 'Apply to a job' },
  'complete-profile': { coins: 20, name: 'Complete profile' },
  'practice-interview': { coins: 15, name: 'Practice interview' },
  'optimize-linkedin': { coins: 15, name: 'Optimize LinkedIn' },
  'daily-login': { coins: 3, name: 'Daily login' },
  'refer-friend': { coins: 50, name: 'Refer a friend' }
} as const;

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyExtensionAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const body = await request.json();
    const { taskId, taskName } = body;

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required', code: 'MISSING_TASK_ID' }, { status: 400 });
    }

    const taskConfig = EXTENSION_TASKS[taskId as keyof typeof EXTENSION_TASKS];
    const coins = taskConfig?.coins || 5;

    const existing = await prisma.userTask.findFirst({
      where: {
        userId: auth.userId,
        taskId,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    if (existing && existing.status === 'completed') {
      return NextResponse.json({
        success: true,
        coinsEarned: 0,
        message: 'Task already completed today',
        newStreak: undefined
      });
    }

    if (existing) {
      await prisma.userTask.update({
        where: { id: existing.id },
        data: { status: 'completed', completedAt: new Date() }
      });
    } else {
      await prisma.userTask.create({
        data: {
          userId: auth.userId,
          taskId,
          status: 'completed',
          completedAt: new Date()
        }
      });
    }

    const userCoins = await prisma.userCoins.upsert({
      where: { userId: auth.userId },
      update: { coins: { increment: coins } },
      create: { userId: auth.userId, coins }
    });

    let newStreak: number | undefined;
    const streak = await prisma.userStreak.findUnique({ where: { userId: auth.userId } });
    
    if (streak) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastCompleted = streak.lastCompletedAt ? new Date(streak.lastCompletedAt) : null;
      
      if (lastCompleted) {
        lastCompleted.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newStreak = streak.currentStreak + 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        } else {
          newStreak = streak.currentStreak;
        }
      } else {
        newStreak = 1;
      }

      await prisma.userStreak.update({
        where: { userId: auth.userId },
        data: {
          currentStreak: newStreak,
          maxStreak: Math.max(streak.maxStreak, newStreak),
          lastCompletedAt: today
        }
      });
    } else {
      await prisma.userStreak.create({
        data: {
          userId: auth.userId,
          currentStreak: 1,
          maxStreak: 1,
          lastCompletedAt: new Date()
        }
      });
      newStreak = 1;
    }

    return NextResponse.json({
      success: true,
      coinsEarned: coins,
      newStreak,
      message: `Task completed! +${coins} coins`
    });
  } catch (error) {
    console.error('Extension task completion error:', error);
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}