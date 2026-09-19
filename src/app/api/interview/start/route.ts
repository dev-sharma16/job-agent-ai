import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { jdFormatted, cvFormatted, intro, jobId } = await req.json();

    if (!jdFormatted || !cvFormatted || !intro) {
      return NextResponse.json({ error: "JD, CV, and intro are required" }, { status: 400 });
    }

    const prompt = `
You are an expert interviewer. Conduct a mock interview.

JD: ${JSON.stringify(jdFormatted)}
CV: ${JSON.stringify(cvFormatted)}
Candidate Intro: ${intro}

Generate 5-7 behavioral + technical questions tailored to this role and candidate.
Return JSON: { questions: [{ id, question, type, expectedKeyPoints }] }
`;

    const result = await callGemini(prompt);
    let parsedResult;
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      parsedResult = jsonMatch ? JSON.parse(jsonMatch[0]) : { questions: [] };
    } catch {
      parsedResult = { questions: [] };
    }

    const interviewId = crypto.randomUUID();
    const firstQuestion = parsedResult.questions?.[0] || {
      id: "1",
      question: "Can you walk me through your background and why you're interested in this role?",
      type: "behavioral",
      expectedKeyPoints: ["Background", "Motivation", "Role fit"]
    };

    return NextResponse.json({
      success: true,
      interviewId,
      question: firstQuestion.question,
      questions: parsedResult.questions || [],
      message: "Interview started"
    });
  } catch (error) {
    console.error("Start interview error:", error);
    return NextResponse.json({ error: "Failed to start interview" }, { status: 500 });
  }
}