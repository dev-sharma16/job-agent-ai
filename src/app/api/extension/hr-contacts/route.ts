import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyExtensionAuth } from "@/lib/extension-auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyExtensionAuth(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const company = searchParams.get("company");
    const location = searchParams.get("location");
    const designation = searchParams.get("designation");

    const where: any = {};
    if (company) where.company = { contains: company, mode: "insensitive" };
    if (location) where.location = { contains: location, mode: "insensitive" };
    if (designation) where.designation = { contains: designation, mode: "insensitive" };

    const contacts = await prisma.scrappedHR.findMany({
      where,
      take: 20,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ 
      contacts: contacts.map((c) => ({
        linkedinId: c.linkedinId,
        name: c.name,
        designation: c.designation,
        company: c.company,
        location: c.location,
        profileUrl: c.profileUrl,
        profilePicture: c.profilePicture,
      })),
    });
  } catch (error) {
    console.error("Extension HR lookup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyExtensionAuth(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await request.json();
    const { linkedinId, name, designation, company, location, profileUrl, profilePicture } = body;

    if (!company) {
      return NextResponse.json({ error: "Company is required" }, { status: 400 });
    }

    const linkedinIdKey = linkedinId || `${company}-${name}`.toLowerCase().replace(/\s+/g, "-");

    const contact = await prisma.scrappedHR.upsert({
      where: {
        id: (await prisma.scrappedHR.findFirst({
          where: { linkedinId: linkedinIdKey, company },
        }))?.id ?? "new",
      },
      update: { name, designation, company, location, profileUrl, profilePicture },
      create: { linkedinId: linkedinIdKey, name, designation, company, location, profileUrl, profilePicture },
    });

    return NextResponse.json({ success: true, contact });
  } catch (error) {
    console.error("Extension HR save error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}