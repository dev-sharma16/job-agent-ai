import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { checkRateLimit } from "@/lib/rate-limit";

function parseAuthToken(token: string): { userId: string; extensionId: string; iat: number; exp: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { type, email, password } = await req.json();

    if (type === "login") {
      const ip = req.headers.get("x-forwarded-for") || "unknown";
      const allowed = await checkRateLimit("ext_login", ip, 20, 600, 900);
      if (!allowed) {
        return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.passwordHash) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      const expiry = Math.floor(Date.now() / 1000) + 86400 * 7;
      const payload = `${user.id}:${expiry}`;
      const hmac = crypto
        .createHmac("sha256", process.env.EXTENSION_HMAC_KEY!)
        .update(payload)
        .digest("hex");
      const token = Buffer.from(`${payload}:${hmac}`).toString("base64");

      const encryptId = encryptData(user.id);

      return NextResponse.json({
        success: true,
        token,
        expires: expiry,
        encryptId,
        auth: Buffer.from(user.id).toString("base64"),
      });
    }

    if (type === "register_extension") {
      const { userId, extensionId } = await req.json();
      if (!userId || !extensionId) {
        return NextResponse.json({ error: "Missing userId or extensionId" }, { status: 400 });
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      await prisma.user.update({
        where: { id: userId },
        data: { extensionId },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Extension auth error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function encryptData(text: string): string {
  // Simple encryption for backward compatibility
  const ENCRYPTION_KEY = process.env.COOKIE_ENCRYPTION_KEY!;
  const IV_LENGTH = 16;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY, "hex"), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}