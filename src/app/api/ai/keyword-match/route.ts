import { NextRequest, NextResponse } from "next/server";
import { matchKeywords, scoreResumeATS } from "@/lib/ai/keyword-matcher";

export async function POST(req: NextRequest) {
  try {
    const { resumeText, jdText, action } = await req.json();

    if (!resumeText) {
      return NextResponse.json({ error: "Resume text is required" }, { status: 400 });
    }

    if (action === "score" || !action) {
      const result = await scoreResumeATS(resumeText, jdText);
      return NextResponse.json({ success: true, data: result });
    }

    if (action === "match") {
      if (!jdText) {
        return NextResponse.json({ error: "Job description is required for keyword matching" }, { status: 400 });
      }
      const result = await matchKeywords(resumeText, jdText);
      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Keyword matching error:", error);
    return NextResponse.json({ error: "Failed to analyze keywords" }, { status: 500 });
  }
}