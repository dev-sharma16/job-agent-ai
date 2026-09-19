import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { targetRole, jobDescription, currentTitle, currentCompany, yearsExperience, keySkills, achievements, education } = await req.json();

    if (!targetRole) {
      return NextResponse.json({ error: "Target role is required" }, { status: 400 });
    }

    const prompt = `
You are an expert resume writer. Create an ATS-optimized resume for the target role.

Target Role: ${targetRole}
${jobDescription ? `Job Description:\n${jobDescription}\n` : ""}
${currentTitle ? `Current Title: ${currentTitle}\n` : ""}
${currentCompany ? `Current Company: ${currentCompany}\n` : ""}
${yearsExperience ? `Years of Experience: ${yearsExperience}\n` : ""}
${education ? `Education: ${education}\n` : ""}
${keySkills ? `Key Skills: ${keySkills}\n` : ""}
${achievements ? `Key Achievements: ${achievements}\n` : ""}

Generate a comprehensive resume in JSON format with these fields:
{
  "targetRole": "string",
  "summary": "string - 3-4 sentence professional summary tailored to the target role",
  "experience": [
    {
      "title": "string",
      "company": "string",
      "location": "string",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM | Present",
      "description": "string - bullet points with quantified achievements"
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "location": "string",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "gpa": "string"
    }
  ],
  "skills": [
    {
      "name": "string",
      "level": "Beginner|Intermediate|Advanced|Expert",
      "category": "Programming Languages|Frontend|Backend|Database|DevOps|Cloud|Tools|Testing|Design|Other"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"],
      "link": "string",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM"
    }
  ],
  "certifications": [],
  "achievements": []
}

Make it ATS-friendly with relevant keywords from the job description. Use action verbs and quantify achievements with numbers.
`;

    const result = await callGemini(prompt);
    
    let parsedData;
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Return a structured fallback
      parsedData = {
        targetRole,
        summary: `Experienced professional seeking ${targetRole} position with ${yearsExperience || "several"} years of experience.`,
        experience: [],
        education: [],
        skills: keySkills?.split(",").map((s: string) => ({ name: s.trim(), level: "Advanced", category: "Programming Languages" })) || [],
        projects: [],
        certifications: [],
        achievements: []
      };
    }

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error) {
    console.error("AI Resume Builder error:", error);
    return NextResponse.json({ error: "Failed to generate resume" }, { status: 500 });
  }
}