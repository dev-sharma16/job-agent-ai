import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { razorpay, PLANS, COIN_REDEMPTION } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planType, useCoins } = await req.json();

    if (useCoins) {
      // Coin redemption for premium
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { coins: true },
      });

      if (!user?.coins || user.coins.coins < COIN_REDEMPTION.coinsRequired) {
        return NextResponse.json({ error: "Insufficient coins" }, { status: 400 });
      }

      // Deduct coins & activate premium
      await prisma.$transaction([
        prisma.userCoins.update({
          where: { userId: user.id },
          data: { coins: { decrement: COIN_REDEMPTION.coinsRequired } },
        }),
        prisma.premiumMembership.upsert({
          where: { userId: user.id },
          create: { 
            userId: user.id, 
            planId: COIN_REDEMPTION.planId, 
            endDate: new Date(Date.now() + 30 * 86400000) 
          },
          update: { 
            planId: COIN_REDEMPTION.planId, 
            endDate: new Date(Date.now() + 30 * 86400000), 
            isActive: true 
          },
        }),
        prisma.coinRedemption.create({ data: { userId: user.id, coinsUsed: COIN_REDEMPTION.coinsRequired, planId: COIN_REDEMPTION.planId } }),
      ]);

      return NextResponse.json({ success: true, method: "coins" });
    }

    const plan = PLANS[planType as keyof typeof PLANS];
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: plan.amount,
      currency: "INR",
      receipt: `order_${session.user.id}_${Date.now()}`,
      notes: { userId: session.user.id, planId: plan.id.toString() },
    });

    // Store pending transaction
    await prisma.transaction.create({
      data: {
        userId: session.user.id,
        razorpayId: order.id,
        amount: plan.amount,
        planId: plan.id,
        status: "pending",
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}