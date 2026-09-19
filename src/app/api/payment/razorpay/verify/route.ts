import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { razorpay } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Update transaction & activate premium
    const transaction = await prisma.transaction.findUnique({
      where: { razorpayId: razorpay_order_id },
    });

    if (!transaction || transaction.userId !== session.user.id) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const planDuration = { 1: 30, 2: 90, 3: 365 }[(transaction.planId ?? 1) as 1 | 2 | 3] || 30;

    await prisma.$transaction([
      prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "captured", razorpayPaymentId: razorpay_payment_id },
      }),
      prisma.premiumMembership.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          planId: transaction.planId!,
          endDate: new Date(Date.now() + planDuration * 86400000),
        },
        update: {
          planId: transaction.planId!,
          endDate: new Date(Date.now() + planDuration * 86400000),
          isActive: true,
        },
      }),
    ]);

    // Send membership email (optional)
    // await sendMembershipEmail(session.user.email);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}