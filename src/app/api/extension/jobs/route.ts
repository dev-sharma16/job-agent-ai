import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyExtensionAuth, extractExtensionAuth } from '@/lib/extension-auth';

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyExtensionAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const body = await request.json();
    const { job, hrContacts } = body;

    if (!job || !job.originalId || !job.jobSource || !job.companyName || !job.jobTitle || !job.jobUrl) {
      return NextResponse.json({ error: 'Invalid job data', code: 'INVALID_JOB_DATA' }, { status: 400 });
    }

    const existing = await prisma.jobApplication.findFirst({
      where: {
        userId: auth.userId,
        originalId: job.originalId,
        source: job.jobSource
      }
    });

    if (existing) {
      return NextResponse.json({ 
        success: true, 
        jobApplicationId: existing.id,
        message: 'Job already saved',
        coinsEarned: 0
      });
    }

    const jobApplication = await prisma.jobApplication.create({
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

    let coinsEarned = 5;

    if (hrContacts && hrContacts.length > 0) {
      for (const contact of hrContacts) {
        const linkedinId = contact.linkedinId || `${contact.company}-${contact.name}`.toLowerCase().replace(/\s+/g, '-');
        
        const existingHR = await prisma.scrappedHR.findFirst({
          where: {
            linkedinId,
            company: contact.company
          }
        });

        if (existingHR) {
          await prisma.scrappedHR.update({
            where: { id: existingHR.id },
            data: {
              name: contact.name,
              designation: contact.designation,
              location: contact.location,
              profileUrl: contact.profileUrl,
              profilePicture: contact.profilePicture
            }
          });
        } else {
          await prisma.scrappedHR.create({
            data: {
              linkedinId,
              name: contact.name,
              designation: contact.designation,
              company: contact.company,
              location: contact.location,
              profileUrl: contact.profileUrl,
              profilePicture: contact.profilePicture
            }
          });
        }
      }
      coinsEarned += hrContacts.length * 2;
    }

    const userCoins = await prisma.userCoins.upsert({
      where: { userId: auth.userId },
      update: { coins: { increment: coinsEarned } },
      create: { userId: auth.userId, coins: coinsEarned }
    });

    await prisma.userTask.create({
      data: {
        userId: auth.userId,
        taskId: 'save-job',
        status: 'completed',
        completedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      jobApplicationId: jobApplication.id,
      message: 'Job saved successfully',
      coinsEarned
    });
  } catch (error) {
    console.error('Extension save job error:', error);
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}