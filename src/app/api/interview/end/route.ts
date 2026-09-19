import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { interviewId, history, candidateResponse } = await req.json();

    if (!history) {
      return NextResponse.json({ error: "History required" }, { status: 400 });
    }

    const fullHistory = candidateResponse ? [...history, { role: "candidate", content: candidateResponse, timestamp: new Date().toISOString() }] : history;

    const prompt = `
Full Interview Transcript: ${JSON.stringify(fullHistory)}

Provide comprehensive feedback:
1. Overall Score (0-100)
2. Strengths (3-5 bullet points)
3. Areas for Improvement (3-5 bullet points)
4. Specific Examples from answers
5. Recommended Next Steps

Return JSON:
{
  "score": 75,
  "strengths": ["..."],
  "improvements": ["..."],
  "specificExamples": ["..."],
  "nextSteps": ["..."],
  "detailedFeedback": "Overall assessment paragraph"
}
`;

    const result = await callGemini(prompt);
    let parsedResult;
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      parsedResult = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        score: 50,
        strengths: [],
        improvements: [],
        specificExamples: [],
        nextSteps: [],
        detailedFeedback: "Unable to generate detailed feedback."
      };
    } catch {
      parsedResult = {
        score: 50,
        strengths: ["Good effort"],
        improvements: ["Practice more"],
        specificExamples: [],
        nextSteps: ["Review common questions"],
        detailedFeedback: "Unable to generate detailed feedback."
      };
    }

    return NextResponse.json({
      success: true,
      ...parsedResult,
      message: "Interview completed"
    });
  } catch (error) {
    console.error("End interview error:", error);
    return NextResponse.json({ error: "Failed to end interview" }, { status: 500 });
  }
}