import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyExtensionAuth } from "@/lib/extension-auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyExtensionAuth(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const [coins, streak] = await Promise.all([
      prisma.userCoins.findUnique({ where: { userId: auth.userId } }),
      prisma.userStreak.findUnique({ where: { userId: auth.userId } }),
    ]);

    return NextResponse.json({ 
      coins: coins?.coins || 0, 
      streak: streak?.currentStreak || 0,
      maxStreak: streak?.maxStreak || 0,
    });
  } catch (error) {
    console.error("Extension coins error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}