import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { jdText, cvText, jobId } = await req.json();

    if (!jdText || !cvText) {
      return NextResponse.json({ error: "Job description and CV are required" }, { status: 400 });
    }

    // Format JD
    const jdPrompt = `
Format this job description into structured sections:
1. Role Overview
2. Key Responsibilities
3. Required Skills & Qualifications
4. Preferred Skills
5. Company Culture/Values

Job Description:
${jdText}

Return as JSON with these keys.
`;
    const jdResult = await callGemini(jdPrompt);
    let formattedJD;
    try {
      const jsonMatch = jdResult.match(/\{[\s\S]*\}/);
      formattedJD = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: jdText };
    } catch {
      formattedJD = { raw: jdText };
    }

    // Format CV
    const cvPrompt = `
Extract and structure this resume into:
1. Professional Summary
2. Technical Skills (categorized)
3. Work Experience (with quantified achievements)
4. Education
5. Projects
6. Certifications

Resume:
${cvText}

Return as JSON with these keys.
`;
    const cvResult = await callGemini(cvPrompt);
    let formattedCV;
    try {
      const jsonMatch = cvResult.match(/\{[\s\S]*\}/);
      formattedCV = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: cvText };
    } catch {
      formattedCV = { raw: cvText };
    }

    return NextResponse.json({
      success: true,
      formattedJD,
      formattedCV,
      message: "JD and CV formatted successfully"
    });
  } catch (error) {
    console.error("Format JD/CV error:", error);
    return NextResponse.json({ error: "Failed to format JD and CV" }, { status: 500 });
  }
}