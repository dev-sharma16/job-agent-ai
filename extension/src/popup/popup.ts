import { apiClient } from '../lib/api';
import { getUserId, clearUserData, setUserId } from '../lib/storage';

const statusEl = document.getElementById('status')!;
const statusTextEl = document.getElementById('statusText')!;
const connectedView = document.getElementById('connectedView')!;
const disconnectedView = document.getElementById('disconnectedView')!;
const loginBtn = document.getElementById('loginBtn')!;
const logoutBtn = document.getElementById('logoutBtn');
const saveCurrentJobBtn = document.getElementById('saveCurrentJobBtn')!;
const scrapePageBtn = document.getElementById('scrapePageBtn')!;
const openDashboardBtn = document.getElementById('openDashboardBtn')!;
const resyncAuthBtn = document.getElementById('resyncAuthBtn')!;
const savedJobsCountEl = document.getElementById('savedJobsCount')!;
const coinsCountEl = document.getElementById('coinsCount')!;
const streakCountEl = document.getElementById('streakCount')!;

async function initializePopup(): Promise<void> {
  await apiClient.initialize({ apiBaseUrl: 'http://localhost:3000' });
  await syncAuthIfNeeded();
  // Re-initialize to pick up any auth token stored by background sync
  await apiClient.initialize({ apiBaseUrl: 'http://localhost:3000' });
  await updateUI();
}

async function syncAuthIfNeeded(): Promise<void> {
  const userId = await getUserId();
  if (!userId) {
    try {
      // Try direct sync from popup (may have better cookie access)
      const result = await syncAuthFromWebsiteDirect();
      if (result) {
        await setUserId(result.userId);
        await apiClient.setAuthToken(result.userId);
        return;
      }
    } catch {
      // Fall through to background sync
    }
    
    try {
      await chrome.runtime.sendMessage({ type: 'SYNC_AUTH_FROM_WEBSITE' });
      await new Promise(r => setTimeout(r, 500));
    } catch {
      // Ignore sync errors
    }
  }
}

async function syncAuthFromWebsiteDirect(): Promise<{ userId: string; authToken: string } | null> {
  try {
    const extensionId = apiClient.getExtensionId();
    const response = await fetch('http://localhost:3000/api/extension/auth/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Extension-ID': extensionId || ''
      },
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.userId && data.authToken) {
        return { userId: data.userId, authToken: data.authToken };
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function updateUI(): Promise<void> {
  const userId = await getUserId();
  
  if (userId) {
    statusEl.className = 'status connected';
    statusTextEl.textContent = 'Connected';
    connectedView.classList.remove('hidden');
    disconnectedView.classList.add('hidden');
    
    try {
      await loadDashboardStats();
    } catch {
      // Stats loading failed, but user is still connected
    }
  } else {
    statusEl.className = 'status disconnected';
    statusTextEl.textContent = 'Not connected';
    connectedView.classList.add('hidden');
    disconnectedView.classList.remove('hidden');
  }
}

async function loadDashboardStats(): Promise<void> {
  try {
    const response = await fetch('http://localhost:3000/api/extension/stats', {
      headers: {
        'Authorization': `Bearer ${apiClient.getAuthToken()}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      savedJobsCountEl.textContent = data.savedJobs || '0';
      coinsCountEl.textContent = data.coins || '0';
      streakCountEl.textContent = data.streak || '0';
    }
  } catch {
    // Ignore errors
  }
}

loginBtn.addEventListener('click', async () => {
  loginBtn.disabled = true;
  loginBtn.innerHTML = `
    <span class="spinner"></span>
    <span>Opening login...</span>
  `;
  
  try {
    const extensionId = apiClient.getExtensionId();
    const url = `http://localhost:3000/login?extension=true&extId=${extensionId}`;
    await chrome.tabs.create({ url });
    window.close();
  } catch (error) {
    loginBtn.disabled = false;
    loginBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
        <polyline points="10 17 15 12 10 7"></polyline>
        <line x1="15" y1="12" x2="3" y2="12"></line>
      </svg>
      Sign In to autoJob
    `;
  }
});

saveCurrentJobBtn.addEventListener('click', async () => {
  saveCurrentJobBtn.disabled = true;
  const originalText = saveCurrentJobBtn.innerHTML;
  saveCurrentJobBtn.innerHTML = '<span class="spinner"></span><span>Saving...</span>';
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) throw new Error('No active tab');
    
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        return new Promise((resolve) => {
          chrome.runtime.sendMessage({ type: 'SAVE_CURRENT_JOB' }, resolve);
        });
      }
    });
    
    const result = results[0]?.result;
    if (result?.success) {
      showToast('Job saved successfully!');
      await loadDashboardStats();
    } else {
      showToast(result?.message || 'Failed to save job', true);
    }
  } catch (error) {
    showToast('Failed to save job', true);
  } finally {
    saveCurrentJobBtn.disabled = false;
    saveCurrentJobBtn.innerHTML = originalText;
  }
});

scrapePageBtn.addEventListener('click', async () => {
  scrapePageBtn.disabled = true;
  const originalText = scrapePageBtn.innerHTML;
  scrapePageBtn.innerHTML = '<span class="spinner"></span><span>Scraping...</span>';
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) throw new Error('No active tab');
    
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        return new Promise((resolve) => {
          chrome.runtime.sendMessage({ type: 'SCRAPE_CURRENT_PAGE' }, resolve);
        });
      }
    });
    
    const result = results[0]?.result;
    if (result?.success) {
      showToast(`Found ${result.jobs?.length || 0} jobs. Saved!`);
      await loadDashboardStats();
    } else {
      showToast('No jobs found on this page', true);
    }
  } catch (error) {
    showToast('Failed to scrape page', true);
  } finally {
    scrapePageBtn.disabled = false;
    scrapePageBtn.innerHTML = originalText;
  }
});

openDashboardBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: 'http://localhost:3000/dashboard' });
  window.close();
});

resyncAuthBtn.addEventListener('click', async () => {
  resyncAuthBtn.disabled = true;
  const originalText = resyncAuthBtn.innerHTML;
  resyncAuthBtn.innerHTML = '<span class="spinner"></span><span>Re-syncing...</span>';
  
  try {
    const extensionId = apiClient.getExtensionId();
    const url = `http://localhost:3000/login?extension=true&extId=${extensionId}&resync=true`;
    await chrome.tabs.create({ url });
    window.close();
  } catch (error) {
    showToast('Failed to re-sync', true);
    resyncAuthBtn.disabled = false;
    resyncAuthBtn.innerHTML = originalText;
  }
});

function showToast(message: string, isError = false): void {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%);
    padding: 12px 24px; border-radius: 8px; font-size: 13px; font-weight: 500;
    z-index: 10000; animation: slideUp 0.3s ease;
    ${isError ? 'background: #fee2e2; color: #dc2626;' : 'background: #ecfdf5; color: #065f46;'}
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideUp 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    from { opacity: 0; transform: translateX(-50%) translateY(10px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
`;
document.head.appendChild(style);

// Listen for auth changes
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'AUTH_CHANGED') {
    updateUI();
  }
});

initializePopup();