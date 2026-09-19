import { callGemini } from "@/lib/gemini";
import { aiCache } from "@/lib/ai/cache";

export interface InterviewQuestion {
  id: string;
  question: string;
  type: "behavioral" | "technical" | "situational" | "followup";
  expectedKeyPoints: string[];
  difficulty: "easy" | "medium" | "hard";
}

export interface InterviewSetup {
  jdFormatted: any;
  cvFormatted: any;
  intro: string;
  targetRole: string;
}

export async function generateInitialQuestions(setup: InterviewSetup): Promise<InterviewQuestion[]> {
  const cacheKey = `questions:${hashString(JSON.stringify(setup))}`;
  
  const cached = await aiCache.getInterviewCache(`questions:${hashString(JSON.stringify(setup.jdFormatted))}`);
  if (cached) {
    return cached;
  }

  const prompt = `
You are an expert interviewer. Generate 5-7 initial interview questions.

JD: ${JSON.stringify(setup.jdFormatted)}
CV: ${JSON.stringify(setup.cvFormatted)}
Candidate Intro: ${setup.intro}
Target Role: ${setup.targetRole}

Generate 5-7 questions (mix of behavioral, technical, situational).
Return JSON: { questions: [{ id, question, type, expectedKeyPoints, difficulty }] }
`;

  const result = await callGemini(prompt);
  let questions: InterviewQuestion[] = [];
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { questions: [] };
    questions = parsed.questions || [];
  } catch {
    questions = getDefaultQuestions();
  }

  // Cache for 1 hour
  await aiCache.setInterviewCache(`questions:${hashString(JSON.stringify(setup.jdFormatted))}`, questions);
  return questions;
}

export async function generateFollowUpQuestion(
  history: any[],
  lastAnswer: string,
  questionIndex: number
): Promise<InterviewQuestion> {
  const prompt = `
Interview History: ${JSON.stringify(history.slice(-4))}
Candidate's Last Answer: ${lastAnswer}
Question Index: ${questionIndex}

Generate 1 contextual follow-up question. Dig deeper into their answer.
Return JSON: { id, question, type, expectedKeyPoints, difficulty }
`;

  const result = await callGemini(prompt);
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : getDefaultFollowUp();
  } catch {
    return getDefaultFollowUp();
  }
}

export async function generateInterviewFeedback(history: any[]): Promise<any> {
  const prompt = `
Full Interview Transcript: ${JSON.stringify(history)}

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
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : getDefaultFeedback();
  } catch {
    return getDefaultFeedback();
  }
}

function getDefaultQuestions(): any[] {
  return [
    { id: "1", question: "Can you walk me through your background and why you're interested in this role?", type: "behavioral", expectedKeyPoints: ["Background", "Motivation", "Role fit"], difficulty: "easy" },
    { id: "2", question: "Describe a challenging project you worked on. What was your role and the outcome?", type: "behavioral", expectedKeyPoints: ["Problem solving", "Ownership", "Results"], difficulty: "medium" },
    { id: "3", question: "How do you stay updated with new technologies in your field?", type: "behavioral", expectedKeyPoints: ["Learning mindset", "Resources", "Application"], difficulty: "easy" },
  ];
}

function getDefaultFollowUp() {
  return { id: "followup", question: "Can you elaborate on that with a specific example?", type: "followup" as const, expectedKeyPoints: ["Specifics", "Details"], difficulty: "medium" as const };
}

function getDefaultFeedback() {
  return {
    score: 50,
    strengths: ["Good effort"],
    improvements: ["Practice more"],
    specificExamples: [],
    nextSteps: ["Review common questions"],
    detailedFeedback: "Unable to generate detailed feedback.",
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