import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const coins = await prisma.userCoins.findUnique({ where: { userId: session.user.id } });
    const streak = await prisma.userStreak.findUnique({ where: { userId: session.user.id } });
    const premium = await prisma.premiumMembership.findUnique({ where: { userId: session.user.id } });

    return NextResponse.json({
      coins: coins?.coins || 0,
      streak: streak?.currentStreak || 0,
      maxStreak: streak?.maxStreak || 0,
      premium: premium ? { planId: premium.planId, endDate: premium.endDate, isActive: premium.isActive } : null,
    });
  } catch (error) {
    console.error("Coin balance error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}