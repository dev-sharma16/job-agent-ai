import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";
import { aiCache } from "@/lib/ai/cache";

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export async function POST(req: NextRequest) {
  try {
    const { profileData, targetRoles, useCache = true } = await req.json();

    if (!profileData || !targetRoles || targetRoles.length === 0) {
      return NextResponse.json({ error: "Profile data and target roles are required" }, { status: 400 });
    }

    const profileHash = hashString(profileData);
    const rolesKey = targetRoles.sort().join(",");
    const cacheKey = `${profileHash}:${rolesKey}`;

    // Check cache first
    if (useCache) {
      const cached = await aiCache.getLinkedInCache(cacheKey);
      if (cached) {
        return NextResponse.json({ success: true, data: cached, cached: true });
      }
    }

    const prompt = `
Analyze this LinkedIn profile and provide comprehensive optimization suggestions.

Profile Data:
${profileData}

Target Roles: ${targetRoles.join(", ")}

Return JSON with:
{
  "headline": "Optimized headline (120 chars max) - keyword-rich, value-driven",
  "about": "Optimized About section (2000 chars max) - story-driven, keyword-rich, quantifiable",
  "skills": ["top 20 skills to add - prioritized by relevance to target roles"],
  "experienceSuggestions": [{ "role": "current/previous role", "suggestedBullets": ["quantified achievement 1", "quantified achievement 2", "quantified achievement 3"] }],
  "keywordGaps": ["missing keywords for target roles - prioritized by search volume"],
  "profileScore": 85,
  "searchabilityScore": 80,
  "completenessScore": 90
}

Focus on:
1. ATS-friendly keywords from target role job descriptions
2. Quantified achievements (numbers, percentages, scale)
3. Industry-standard keywords and buzzwords
4. Skills prioritization based on target role demand
5. Profile completeness for LinkedIn algorithm
`;

    const result = await callGemini(prompt);
    let parsedResult;
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      parsedResult = jsonMatch ? JSON.parse(jsonMatch[0]) : getDefaultResult();
    } catch {
      parsedResult = getDefaultResult();
    }

    // Cache for 24 hours
    await aiCache.setLinkedInCache(cacheKey, parsedResult);

    return NextResponse.json({ success: true, data: parsedResult, cached: false });
  } catch (error) {
    console.error("LinkedIn optimize error:", error);
    return NextResponse.json({ error: "Failed to optimize profile" }, { status: 500 });
  }
}

function getDefaultResult() {
  return {
    headline: "Optimized headline",
    about: "Optimized about section",
    skills: [],
    experienceSuggestions: [],
    keywordGaps: [],
    profileScore: 50,
    searchabilityScore: 50,
    completenessScore: 50,
  };
}