import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { profileData, targetRoles } = await req.json();

    if (!profileData || !targetRoles || targetRoles.length === 0) {
      return NextResponse.json({ error: "Profile data and target roles are required" }, { status: 400 });
    }

    const prompt = `
Analyze this LinkedIn profile and provide optimization suggestions.

Profile Data:
${profileData}

Target Roles: ${targetRoles.join(", ")}

Return JSON with:
{
  "headline": "Optimized headline (120 chars max)",
  "about": "Optimized About section (2000 chars max)",
  "skills": ["top 20 skills to add"],
  "experienceSuggestions": [{ "role": "current role", "suggestedBullets": ["bullet 1", "bullet 2"] }],
  "keywordGaps": ["missing keywords for target roles"],
  "profileScore": 85
}
`;

    const result = await callGemini(prompt);
    let parsedResult;
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      parsedResult = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        headline: "Optimized headline",
        about: "Optimized about section",
        skills: [],
        experienceSuggestions: [],
        keywordGaps: [],
        profileScore: 50
      };
    } catch {
      parsedResult = {
        headline: "Optimized headline",
        about: "Optimized about section",
        skills: [],
        experienceSuggestions: [],
        keywordGaps: [],
        profileScore: 50
      };
    }

    return NextResponse.json({ success: true, data: parsedResult });
  } catch (error) {
    console.error("LinkedIn optimize error:", error);
    return NextResponse.json({ error: "Failed to optimize profile" }, { status: 500 });
  }
}