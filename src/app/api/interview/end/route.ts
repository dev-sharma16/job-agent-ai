import { NextRequest, NextResponse } from "next/server";
import { generateInterviewFeedback } from "@/lib/ai/interview-generator";

export async function POST(req: NextRequest) {
  try {
    const { interviewId, history, candidateResponse } = await req.json();

    if (!history) {
      return NextResponse.json({ error: "History required" }, { status: 400 });
    }

    const fullHistory = candidateResponse ? [...history, { role: "candidate", content: candidateResponse, timestamp: new Date().toISOString() }] : history;

    const feedback = await generateInterviewFeedback(fullHistory);

    return NextResponse.json({
      success: true,
      ...feedback,
      message: "Interview completed"
    });
  } catch (error) {
    console.error("End interview error:", error);
    return NextResponse.json({ error: "Failed to end interview" }, { status: 500 });
  }
}