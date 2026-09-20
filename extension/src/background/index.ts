import { apiClient } from '../lib/api';
import { getPendingJobs, addPendingJob, removePendingJob, clearPendingJobs, getSettings, getUserId, setUserId, clearUserData, setLastSync } from '../lib/storage';
import type { JobData, SaveJobResponse, ExtensionSettings } from '../types';

const SYNC_INTERVAL_MINUTES = 15;
const MAX_RETRY_ATTEMPTS = 3;

chrome.runtime.onInstalled.addListener(async () => {
  await initializeExtension();
  setupAlarms();
});

chrome.runtime.onStartup.addListener(async () => {
  await initializeExtension();
  setupAlarms();
});

async function initializeExtension(): Promise<void> {
  const settings = await getSettings();
  await apiClient.initialize(settings);
  
  const userId = await getUserId();
  if (userId) {
    await apiClient.setAuthToken(userId);
  }
  
  // Try to sync auth from website on startup
  await syncAuthFromWebsite();
}

function setupAlarms(): void {
  chrome.alarms.create('syncPendingJobs', { periodInMinutes: SYNC_INTERVAL_MINUTES });
  chrome.alarms.create('checkAuth', { periodInMinutes: 60 });
  chrome.alarms.create('syncAuthFromWebsite', { periodInMinutes: 5 });
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'syncPendingJobs') {
    await syncPendingJobs();
  } else if (alarm.name === 'checkAuth') {
    await checkAuthStatus();
  } else if (alarm.name === 'syncAuthFromWebsite') {
    await syncAuthFromWebsite();
  }
});

async function syncPendingJobs(): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;

  const pendingJobs = await getPendingJobs();
  if (pendingJobs.length === 0) return;

  try {
    const response = await apiClient.autoSaveJobs(pendingJobs);
    
    if (response.success) {
      for (const job of pendingJobs) {
        await removePendingJob(job.originalId, job.jobSource);
      }
      await setLastSync();
      
      if (response.saved > 0) {
        showNotification(`autoJob: Saved ${response.saved} jobs`);
      }
    }
  } catch (error) {
    console.error('autoJob: Sync failed', error);
  }
}

async function checkAuthStatus(): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;

  try {
    await apiClient.getSettings();
  } catch (error) {
    if (error instanceof Error && error.message.includes('401')) {
      await handleAuthExpired();
    }
  }
}

async function syncAuthFromWebsite(): Promise<void> {
  try {
    const result = await apiClient.syncAuthFromWebsite();
    if (result) {
      await setUserId(result.userId);
      await apiClient.setAuthToken(result.userId);
      console.log('[autoJob] Synced auth from website:', result.userId);
    }
  } catch (error) {
    console.error('[autoJob] Sync auth from website failed:', error);
  }
}

async function handleAuthExpired(): Promise<void> {
  await clearUserData();
  await apiClient.clearAuthToken();
  showNotification('autoJob: Session expired. Please log in again.');
}

function showNotification(message: string): void {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: 'autoJob',
    message
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse);
  return true;
});

// Listen for auth success from OAuth popup
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (message.type === 'AUTOJOB_AUTH_SUCCESS' && message.userId) {
    handleMessage({ type: 'SET_AUTH', userId: message.userId }, sender).then(sendResponse);
    return true;
  }
});

async function handleMessage(message: any, sender: chrome.runtime.MessageSender): Promise<any> {
  switch (message.type) {
    case 'SAVE_JOB': {
      const { job } = message;
      const userId = await getUserId();
      
      if (!userId) {
        await addPendingJob(job);
        return { success: false, message: 'Not logged in. Job queued for sync.' };
      }

      try {
        const response = await apiClient.saveJob(job);
        if (response.success && response.coinsEarned) {
          showNotification(`autoJob: Job saved! +${response.coinsEarned} coins`);
        }
        return response;
      } catch (error) {
        await addPendingJob(job);
        return { success: false, message: 'Saved offline. Will sync when online.' };
      }
    }

    case 'SCRAPE_CURRENT_PAGE': {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) return { success: false, message: 'No active tab' };

      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            return new Promise((resolve) => {
              chrome.runtime.sendMessage({ type: 'SCRAPE_CURRENT_PAGE' }, resolve);
            });
          }
        });
        return results[0]?.result || { success: false, jobs: [] };
      } catch {
        return { success: false, message: 'Cannot scrape this page' };
      }
    }

    case 'AUTO_SAVE_JOBS': {
      const { jobs } = message;
      const userId = await getUserId();
      
      if (!userId) {
        for (const job of jobs) await addPendingJob(job);
        return { success: false, message: 'Not logged in. Jobs queued for sync.' };
      }

      try {
        return await apiClient.autoSaveJobs(jobs);
      } catch (error) {
        for (const job of jobs) await addPendingJob(job);
        return { success: false, message: 'Saved offline. Will sync when online.' };
      }
    }

    case 'LOOKUP_HR_CONTACTS': {
      const { company, location } = message;
      try {
        return await apiClient.lookupHRContacts({ company, location });
      } catch (error) {
        return { success: false, contacts: [] };
      }
    }

    case 'COMPLETE_TASK': {
      const { taskId, taskName } = message;
      try {
        return await apiClient.completeTask(taskId, taskName);
      } catch (error) {
        return { success: false, message: 'Failed to complete task' };
      }
    }

    case 'SET_AUTH': {
      const { userId } = message;
      await setUserId(userId);
      await apiClient.setAuthToken(userId);
      await syncPendingJobs();
      return { success: true };
    }

    case 'LOGOUT': {
      await clearUserData();
      await apiClient.clearAuthToken();
      return { success: true };
    }

    case 'GET_STATUS': {
      const userId = await getUserId();
      const pendingJobs = await getPendingJobs();
      return {
        authenticated: !!userId,
        pendingJobsCount: pendingJobs.length,
        settings: await getSettings()
      };
    }

    case 'SYNC_AUTH_FROM_WEBSITE': {
      await syncAuthFromWebsite();
      const userId = await getUserId();
      return { success: true, authenticated: !!userId };
    }

    case 'UPDATE_SETTINGS': {
      const { settings } = message;
      await apiClient.updateSettings(settings);
      return { success: true };
    }

    default:
      return { success: false, message: 'Unknown message type' };
  }
}

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id) {
    await chrome.action.openPopup();
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const isJobSite = tab.url.includes('linkedin.com/jobs') 
      || tab.url.includes('naukri.com') 
      || tab.url.includes('indeed.com');
    
    if (isJobSite) {
      chrome.action.setBadgeText({ text: '●', tabId });
      chrome.action.setBadgeBackgroundColor({ color: '#0d6efd', tabId });
    }
  }
});