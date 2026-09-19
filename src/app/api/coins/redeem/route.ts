import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { COIN_REDEMPTION } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { coins: true },
    });

    if (!user?.coins || user.coins.coins < COIN_REDEMPTION.coinsRequired) {
      return NextResponse.json({ error: "Insufficient coins" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.userCoins.update({
        where: { userId: user.id },
        data: { coins: { decrement: COIN_REDEMPTION.coinsRequired } },
      }),
      prisma.premiumMembership.upsert({
        where: { userId: user.id },
        create: { userId: user.id, planId: COIN_REDEMPTION.planId, endDate: new Date(Date.now() + 30 * 86400000) },
        update: { planId: COIN_REDEMPTION.planId, endDate: new Date(Date.now() + 30 * 86400000), isActive: true },
      }),
      prisma.coinRedemption.create({ data: { userId: user.id, coinsUsed: COIN_REDEMPTION.coinsRequired, planId: COIN_REDEMPTION.planId } }),
    ]);

    return NextResponse.json({ success: true, method: "coins" });
  } catch (error) {
    console.error("Coin redemption error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}