import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyExtensionAuth } from '@/lib/extension-auth';

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyExtensionAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const body = await request.json();
    const { jobs } = body;

    if (!Array.isArray(jobs) || jobs.length === 0) {
      return NextResponse.json({ error: 'No jobs provided', code: 'NO_JOBS' }, { status: 400 });
    }

    let saved = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const job of jobs) {
      try {
        if (!job.originalId || !job.jobSource || !job.companyName || !job.jobTitle || !job.jobUrl) {
          errors.push(`Invalid job data for ${job.companyName || 'unknown'}`);
          continue;
        }

        const existing = await prisma.jobApplication.findFirst({
          where: {
            userId: auth.userId,
            originalId: job.originalId,
            source: job.jobSource
          }
        });

        if (existing) {
          skipped++;
          continue;
        }

        await prisma.jobApplication.create({
          data: {
            userId: auth.userId,
            originalId: job.originalId,
            companyName: job.companyName,
            jobTitle: job.jobTitle,
            jobUrl: job.jobUrl,
            jobDescription: job.jobDescription,
            location: job.location,
            source: job.jobSource,
            stage: 'bookmarked',
            priority: 'medium',
            skills: job.skills ? {
              create: job.skills.map((skill: string) => ({
                skillName: skill,
                matched: false
              }))
            } : undefined
          }
        });

        saved++;
      } catch (jobError) {
        errors.push(`Failed to save ${job.companyName}: ${jobError instanceof Error ? jobError.message : 'Unknown error'}`);
      }
    }

    if (saved > 0) {
      const coinsEarned = saved * 5;
      await prisma.userCoins.upsert({
        where: { userId: auth.userId },
        update: { coins: { increment: coinsEarned } },
        create: { userId: auth.userId, coins: coinsEarned }
      });
    }

    return NextResponse.json({
      success: true,
      saved,
      skipped,
      errors
    });
  } catch (error) {
    console.error('Extension bulk save error:', error);
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}