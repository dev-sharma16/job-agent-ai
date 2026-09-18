import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, extensionId } = body;

    if (!userId || !extensionId) {
      return NextResponse.json({ error: 'Missing userId or extensionId', code: 'MISSING_PARAMS' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found', code: 'USER_NOT_FOUND' }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { extensionId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Extension auth error:', error);
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}