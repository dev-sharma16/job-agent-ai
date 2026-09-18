import type { JobData, ExtensionSettings } from '../types';
import { DEFAULT_SETTINGS } from '../types';

const STORAGE_KEYS = {
  PENDING_JOBS: 'pendingJobs',
  SETTINGS: 'settings',
  LAST_SYNC: 'lastSync',
  EXTENSION_ID: 'extensionId',
  AUTH_TOKEN: 'authToken',
  USER_ID: 'userId'
} as const;

export async function getPendingJobs(): Promise<JobData[]> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.PENDING_JOBS);
  return result[STORAGE_KEYS.PENDING_JOBS] || [];
}

export async function addPendingJob(job: JobData): Promise<void> {
  const jobs = await getPendingJobs();
  const exists = jobs.some(j => j.originalId === job.originalId && j.jobSource === job.jobSource);
  if (!exists) {
    jobs.push(job);
    await chrome.storage.local.set({ [STORAGE_KEYS.PENDING_JOBS]: jobs });
  }
}

export async function removePendingJob(originalId: string, jobSource: string): Promise<void> {
  const jobs = await getPendingJobs();
  const filtered = jobs.filter(j => !(j.originalId === originalId && j.jobSource === jobSource));
  await chrome.storage.local.set({ [STORAGE_KEYS.PENDING_JOBS]: filtered });
}

export async function clearPendingJobs(): Promise<void> {
  await chrome.storage.local.remove(STORAGE_KEYS.PENDING_JOBS);
}

export async function getSettings(): Promise<ExtensionSettings> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
  return { ...DEFAULT_SETTINGS, ...result[STORAGE_KEYS.SETTINGS] };
}

export async function saveSettings(settings: Partial<ExtensionSettings>): Promise<void> {
  const current = await getSettings();
  await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: { ...current, ...settings } });
}

export async function getLastSync(): Promise<number | null> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.LAST_SYNC);
  return result[STORAGE_KEYS.LAST_SYNC] || null;
}

export async function setLastSync(timestamp: number = Date.now()): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.LAST_SYNC]: timestamp });
}

export async function getUserId(): Promise<string | null> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.USER_ID);
  return result[STORAGE_KEYS.USER_ID] || null;
}

export async function setUserId(userId: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.USER_ID]: userId });
}

export async function clearUserData(): Promise<void> {
  await chrome.storage.local.remove([
    STORAGE_KEYS.PENDING_JOBS,
    STORAGE_KEYS.USER_ID,
    STORAGE_KEYS.AUTH_TOKEN,
    STORAGE_KEYS.LAST_SYNC
  ]);
}