import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyExtensionAuth } from '@/lib/extension-auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyExtensionAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const [savedJobs, userCoins, userStreak, recentApplications] = await Promise.all([
      prisma.jobApplication.count({ where: { userId: auth.userId } }),
      prisma.userCoins.findUnique({ where: { userId: auth.userId } }),
      prisma.userStreak.findUnique({ where: { userId: auth.userId } }),
      prisma.jobApplication.findMany({
        where: { userId: auth.userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, companyName: true, jobTitle: true, stage: true, createdAt: true }
      })
    ]);

    return NextResponse.json({
      savedJobs,
      coins: userCoins?.coins || 0,
      streak: userStreak?.currentStreak || 0,
      recentApplications
    });
  } catch (error) {
    console.error('Extension stats error:', error);
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}