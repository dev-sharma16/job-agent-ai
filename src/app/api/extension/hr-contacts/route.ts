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
    const { company, location, designation } = body;

    if (!company) {
      return NextResponse.json({ error: 'Company is required', code: 'MISSING_COMPANY' }, { status: 400 });
    }

    const where: any = {
      company: { contains: company, mode: 'insensitive' }
    };

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (designation) {
      where.designation = { contains: designation, mode: 'insensitive' };
    }

    const contacts = await prisma.scrappedHR.findMany({
      where,
      take: 20,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      contacts: contacts.map(c => ({
        linkedinId: c.linkedinId,
        name: c.name,
        designation: c.designation,
        company: c.company,
        location: c.location,
        profileUrl: c.profileUrl,
        profilePicture: c.profilePicture
      }))
    });
  } catch (error) {
    console.error('Extension HR lookup error:', error);
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}