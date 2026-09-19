import { NextRequest, NextResponse } from "next/server";
import { buildResume } from "@/lib/ai/resume-builder";

export async function POST(req: NextRequest) {
  try {
    const { targetRole, jobDescription, currentTitle, currentCompany, yearsExperience, keySkills, achievements, education, currentData } = await req.json();

    if (!targetRole) {
      return NextResponse.json({ error: "Target role is required" }, { status: 400 });
    }

    const resumeData = await buildResume({
      targetRole,
      jobDescription,
      currentData,
    });

    return NextResponse.json({ success: true, data: resumeData });
  } catch (error) {
    console.error("AI Resume Builder error:", error);
    return NextResponse.json({ error: "Failed to generate resume" }, { status: 500 });
  }
}