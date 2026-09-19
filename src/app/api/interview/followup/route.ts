import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { interviewId, history, candidateResponse, questionIndex } = await req.json();

    if (!history || !candidateResponse) {
      return NextResponse.json({ error: "History and response required" }, { status: 400 });
    }

    const prompt = `
Interview History: ${JSON.stringify(history)}
Candidate's Last Answer: ${candidateResponse}
Question Index: ${questionIndex}

Generate 1 contextual follow-up question. Dig deeper into their answer.
Return JSON: { question, type, expectedKeyPoints }
`;

    const result = await callGemini(prompt);
    let parsedResult;
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      parsedResult = jsonMatch ? JSON.parse(jsonMatch[0]) : { question: "Can you elaborate on that?" };
    } catch {
      parsedResult = { question: "Can you elaborate on that?", type: "followup", expectedKeyPoints: [] };
    }

    return NextResponse.json({
      success: true,
      question: parsedResult.question,
      type: parsedResult.type || "followup",
      expectedKeyPoints: parsedResult.expectedKeyPoints || [],
      interviewId
    });
  } catch (error) {
    console.error("Followup error:", error);
    return NextResponse.json({ error: "Failed to generate followup" }, { status: 500 });
  }
}