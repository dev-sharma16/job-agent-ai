import { callGemini } from "@/lib/gemini";
import { aiCache } from "@/lib/ai/cache";
import { ResumeData } from "@/types/resume";

export interface ResumeBuilderInput {
  jobDescription?: string;
  targetRole: string;
  currentData?: ResumeData;
}

export async function buildResume(input: ResumeBuilderInput): Promise<ResumeData> {
  const cacheKey = `${input.targetRole}:${input.jobDescription ? hashString(input.jobDescription) : "no-jd"}`;
  
  // Check cache first
  const cached = await aiCache.getResumeCache("global", cacheKey);
  if (cached) {
    return cached;
  }

  const prompt = `
You are an expert resume writer. Create an ATS-optimized resume.

Target Role: ${input.targetRole}
${input.jobDescription ? `Job Description:\n${input.jobDescription}` : ""}
${input.currentData ? `Current Resume Data:\n${JSON.stringify(input.currentData, null, 2)}` : ""}

Generate JSON with:
{
  "personalDetails": { "name", "email", "phone", "location", "summary" },
  "education": [{ "degree", "institution", "year", "gpa" }],
  "experience": [{ "title", "company", "duration", "bullets" }],
  "skills": [{ "name", "level", "category" }],
  "projects": [{ "name", "description", "tech", "link" }],
  "certifications": [{ "name", "issuer", "year" }],
  "achievements": []
}

Make it ATS-friendly with relevant keywords from the job description. Use action verbs and quantify achievements.
`;

  const result = await callGemini(prompt);
  let parsedData;
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    parsedData = jsonMatch ? JSON.parse(jsonMatch[0]) : getDefaultResumeData();
  } catch {
    parsedData = getDefaultResumeData();
  }

  // Cache the result
  await aiCache.setResumeCache("global", cacheKey, parsedData);

  return parsedData;
}

function getDefaultResumeData(): ResumeData {
  return {
    personal: { fullName: "", email: "", phone: "", location: "", linkedin: "", portfolio: "", summary: "" },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    achievements: [],
  };
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}