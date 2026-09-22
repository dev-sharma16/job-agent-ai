export interface JobData {
  originalId: string;
  jobSource: 'linkedin' | 'naukri' | 'indeed';
  companyName: string;
  jobTitle: string;
  jobUrl: string;
  jobDescription?: string;
  location?: string;
  salaryRange?: string;
  postedDate?: string;
  applicationDeadline?: string;
  hiresNeeded?: number;
  applicantsCount?: number;
  skills?: string[];
}

export interface HRContact {
  linkedinId?: string;
  name: string;
  designation: string;
  company: string;
  location?: string;
  profileUrl?: string;
  profilePicture?: string;
}

export interface SaveJobRequest {
  job: JobData;
  hrmContacts?: HRContact[];
}

export interface SaveJobResponse {
  success: boolean;
  jobApplicationId?: string;
  message?: string;
  coinsEarned?: number;
}

export interface AutoSaveJobsRequest {
  jobs: JobData[];
}

export interface AutoSaveJobsResponse {
  success: boolean;
  saved: number;
  skipped: number;
  errors: string[];
}

export interface HRContactLookupRequest {
  company: string;
  location?: string;
  designation?: string;
}

export interface HRContactLookupResponse {
  success: boolean;
  contacts: HRContact[];
}

export interface TaskCompletionRequest {
  taskId: string;
  taskName: string;
}

export interface TaskCompletionResponse {
  success: boolean;
  coinsEarned: number;
  newStreak?: number;
  message?: string;
}

export interface ExtensionAuthPayload {
  userId: string;
  extensionId: string;
  iat: number;
  exp: number;
}

export interface APIError {
  error: string;
  code: string;
  details?: Record<string, unknown>;
}

export type JobSource = 'linkedin' | 'naukri' | 'indeed' | 'accenture' | 'other';
export type JobStage = 'bookmarked' | 'applying' | 'applied' | 'interviewing' | 'negotiating' | 'accepted' | 'rejected' | 'archived';

export const JOB_STAGES: JobStage[] = [
  'bookmarked',
  'applying',
  'applied',
  'interviewing',
  'negotiating',
  'accepted',
  'rejected',
  'archived'
];

export const JOB_SOURCES: JobSource[] = ['linkedin', 'naukri', 'indeed', 'accenture', 'other'];

export interface ExtensionSettings {
  apiBaseUrl: string;
  autoSaveEnabled: boolean;
  notificationsEnabled: boolean;
  hmacKey?: string;
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  apiBaseUrl: 'http://localhost:3000',
  autoSaveEnabled: true,
  notificationsEnabled: true
};