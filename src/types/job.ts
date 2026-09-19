export type JobStage =
  | "bookmarked"
  | "applying"
  | "applied"
  | "interviewing"
  | "negotiating"
  | "accepted"
  | "rejected"
  | "archived";

export type JobPriority = "low" | "medium" | "high" | "urgent";

export type JobSource = "linkedin" | "naukri" | "indeed" | "glassdoor" | "company" | "referral" | "other";

export interface JobApplication {
  id: string;
  userId: string;
  originalId?: string;
  companyName: string;
  jobTitle: string;
  jobUrl?: string;
  jobDescription?: string;
  location?: string;
  source?: JobSource;
  stage: JobStage;
  priority: JobPriority;
  dateApplied?: string;
  followUp?: string;
  salaryExpected?: string;
  salaryOffered?: string;
  notes?: string;
  isArchived: boolean;
  isTrashed: boolean;
  createdAt: string;
  updatedAt: string;
  skills?: JobSkill[];
  formattedJD?: FormattedJD;
  interviews?: Interview[];
}

export interface JobSkill {
  id: string;
  jobApplicationId: string;
  skillId: number;
  skillName: string;
  matched: boolean;
}

export interface FormattedJD {
  id: string;
  userId: string;
  jobApplicationId: string;
  formattedText: string;
  createdAt: string;
}

export interface Interview {
  id: string;
  interviewId: string;
  userId: string;
  jobApplicationId?: string;
  jdFormatted?: string;
  cvFormatted?: string;
  history: string;
  strengths?: string;
  improvements?: string;
  score?: number;
  completedAt?: string;
  createdAt: string;
}

export const JOB_STAGES: Record<JobStage, { label: string; description: string; order: number }> = {
  bookmarked: { label: "Bookmarked", description: "Saved for later", order: 0 },
  applying: { label: "Applying", description: "Preparing application", order: 1 },
  applied: { label: "Applied", description: "Application submitted", order: 2 },
  interviewing: { label: "Interviewing", description: "In interview process", order: 3 },
  negotiating: { label: "Negotiating", description: "Offer negotiation", order: 4 },
  accepted: { label: "Accepted", description: "Offer accepted!", order: 5 },
  rejected: { label: "Rejected", description: "Not selected", order: 6 },
  archived: { label: "Archived", description: "Closed/archived", order: 7 },
};

export const STAGE_COLORS: Record<JobStage, string> = {
  bookmarked: "bg-gray-100 text-gray-700 border-gray-200",
  applying: "bg-blue-100 text-blue-700 border-blue-200",
  applied: "bg-indigo-100 text-indigo-700 border-indigo-200",
  interviewing: "bg-purple-100 text-purple-700 border-purple-200",
  negotiating: "bg-amber-100 text-amber-700 border-amber-200",
  accepted: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  archived: "bg-slate-100 text-slate-700 border-slate-200",
};

export const PRIORITY_COLORS: Record<JobPriority, string> = {
  low: "bg-gray-100 text-gray-700 border-gray-200",
  medium: "bg-blue-100 text-blue-700 border-blue-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  urgent: "bg-red-100 text-red-700 border-red-200",
};

export const JOB_SOURCES: Record<JobSource, string> = {
  linkedin: "LinkedIn",
  naukri: "Naukri",
  indeed: "Indeed",
  glassdoor: "Glassdoor",
  company: "Company Site",
  referral: "Referral",
  other: "Other",
};