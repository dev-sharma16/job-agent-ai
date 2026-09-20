import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuthToken, importHMACKey } from "@/lib/encryption";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const extensionId = req.headers.get("X-Extension-ID");
    if (!extensionId) {
      return NextResponse.json({ success: false, error: "Extension ID required" }, { status: 400 });
    }

    // Get or create extension record for user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, extensionId: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Update user's extensionId if different
    if (user.extensionId !== extensionId) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { extensionId }
      });
    }

    // Create extension auth token
    const hmacKey = process.env.EXTENSION_HMAC_KEY;
    if (!hmacKey) {
      return NextResponse.json({ success: false, error: "Extension HMAC not configured" }, { status: 500 });
    }

    const key = await importHMACKey(hmacKey);
    const payload = {
      userId: session.user.id,
      extensionId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 * 30
    };
    
    const authToken = createAuthToken(payload);

    return NextResponse.json({ success: true, userId: session.user.id, authToken });
  } catch (error) {
    console.error("Extension auth sync error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}