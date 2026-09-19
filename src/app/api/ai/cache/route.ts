import { NextRequest, NextResponse } from "next/server";
import { aiCache } from "@/lib/ai/cache";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const prefix = searchParams.get("prefix");
    const key = searchParams.get("key");

    if (!prefix || !key) {
      return NextResponse.json({ error: "Prefix and key are required" }, { status: 400 });
    }

    const data = await aiCache.get(prefix, key);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Cache get error:", error);
    return NextResponse.json({ error: "Failed to get cache" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { prefix, key, data, ttl } = await req.json();

    if (!prefix || !key || data === undefined) {
      return NextResponse.json({ error: "Prefix, key, and data are required" }, { status: 400 });
    }

    await aiCache.set(prefix, key, data, ttl);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cache set error:", error);
    return NextResponse.json({ error: "Failed to set cache" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const prefix = searchParams.get("prefix");
    const key = searchParams.get("key");
    const invalidatePrefix = searchParams.get("invalidatePrefix");

    if (invalidatePrefix) {
      await aiCache.invalidatePrefix(invalidatePrefix);
      return NextResponse.json({ success: true });
    }

    if (!prefix || !key) {
      return NextResponse.json({ error: "Prefix and key are required" }, { status: 400 });
    }

    await aiCache.invalidate(prefix, key);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cache delete error:", error);
    return NextResponse.json({ error: "Failed to delete cache" }, { status: 500 });
  }
}