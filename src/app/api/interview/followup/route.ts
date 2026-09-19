import { NextRequest, NextResponse } from "next/server";
import { generateFollowUpQuestion } from "@/lib/ai/interview-generator";

export async function POST(req: NextRequest) {
  try {
    const { interviewId, history, candidateResponse, questionIndex } = await req.json();

    if (!history || !candidateResponse) {
      return NextResponse.json({ error: "History and response required" }, { status: 400 });
    }

    const followUp = await generateFollowUpQuestion(history, candidateResponse, questionIndex);

    return NextResponse.json({
      success: true,
      question: followUp.question,
      type: followUp.type,
      expectedKeyPoints: followUp.expectedKeyPoints,
      difficulty: followUp.difficulty,
      interviewId
    });
  } catch (error) {
    console.error("Followup error:", error);
    return NextResponse.json({ error: "Failed to generate followup" }, { status: 500 });
  }
}