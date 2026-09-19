import { NextRequest, NextResponse } from "next/server";
import { generateInitialQuestions } from "@/lib/ai/interview-generator";

export async function POST(req: NextRequest) {
  try {
    const { jdFormatted, cvFormatted, intro, targetRole } = await req.json();

    if (!jdFormatted || !cvFormatted || !intro) {
      return NextResponse.json({ error: "JD, CV, and intro are required" }, { status: 400 });
    }

    const questions = await generateInitialQuestions({
      jdFormatted,
      cvFormatted,
      intro,
      targetRole: targetRole || "Software Engineer",
    });

    const interviewId = crypto.randomUUID();
    const firstQuestion = questions[0] || {
      id: "1",
      question: "Can you walk me through your background and why you're interested in this role?",
      type: "behavioral",
      expectedKeyPoints: ["Background", "Motivation", "Role fit"],
      difficulty: "easy",
    };

    return NextResponse.json({
      success: true,
      interviewId,
      question: firstQuestion.question,
      questions,
      message: "Interview started"
    });
  } catch (error) {
    console.error("Start interview error:", error);
    return NextResponse.json({ error: "Failed to start interview" }, { status: 500 });
  }
}