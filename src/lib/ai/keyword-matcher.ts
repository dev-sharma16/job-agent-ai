import { callGemini } from "@/lib/gemini";

export interface KeywordMatchResult {
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
}

export interface ResumeATSScore {
  overallScore: number;
  keywordScore: number;
  formatScore: number;
  contentScore: number;
  breakdown: {
    keywords: { matched: string[]; missing: string[] };
    formatting: { issues: string[]; score: number };
    content: { strengths: string[]; gaps: string[] };
  };
  recommendations: string[];
}

export async function matchKeywords(resumeText: string, jdText: string): Promise<KeywordMatchResult> {
  const prompt = `
Analyze this resume against the job description for ATS compatibility.

Resume:
${resumeText}

Job Description:
${jdText}

Return JSON with:
{
  "matchScore": 75,
  "matchedKeywords": ["keyword1", "keyword2"],
  "missingKeywords": ["keyword3", "keyword4"],
  "suggestions": ["Add X to experience", "Include Y in skills"]
}

Focus on: technical skills, tools, methodologies, certifications, soft skills mentioned in JD.
`;

  const result = await callGemini(prompt);
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : getDefaultMatchResult();
  } catch {
    return getDefaultMatchResult();
  }
}

export async function scoreResumeATS(resumeText: string, jdText?: string): Promise<ResumeATSScore> {
  const prompt = `
Analyze this resume for ATS compatibility and overall quality.

Resume:
${resumeText}
${jdText ? `\nJob Description (for keyword matching):\n${jdText}` : ""}

Return JSON with:
{
  "overallScore": 75,
  "keywordScore": 80,
  "formatScore": 85,
  "contentScore": 70,
  "breakdown": {
    "keywords": { "matched": ["React", "TypeScript"], "missing": ["AWS", "Docker"] },
    "formatting": { "issues": ["Missing section headers"], "score": 85 },
    "content": { "strengths": ["Quantified achievements"], "gaps": ["Missing certifications"] }
  },
  "recommendations": ["Add AWS to skills", "Include Docker experience"]
}

Score each category 0-100. Be strict but fair.
`;

  const result = await callGemini(prompt);
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : getDefaultATSScore();
  } catch {
    return getDefaultATSScore();
  }
}

function getDefaultMatchResult(): KeywordMatchResult {
  return {
    matchScore: 0,
    matchedKeywords: [],
    missingKeywords: [],
    suggestions: ["Unable to analyze - please try again"],
  };
}

function getDefaultATSScore(): ResumeATSScore {
  return {
    overallScore: 0,
    keywordScore: 0,
    formatScore: 0,
    contentScore: 0,
    breakdown: {
      keywords: { matched: [], missing: [] },
      formatting: { issues: ["Analysis failed"], score: 0 },
      content: { strengths: [], gaps: ["Analysis failed"] },
    },
    recommendations: ["Please try again"],
  };
}