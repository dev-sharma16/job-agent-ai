import type {
  JobData,
  HRContact,
  SaveJobRequest,
  SaveJobResponse,
  AutoSaveJobsRequest,
  AutoSaveJobsResponse,
  HRContactLookupRequest,
  HRContactLookupResponse,
  TaskCompletionRequest,
  TaskCompletionResponse,
  ExtensionAuthPayload,
  ExtensionSettings,
  APIError
} from '../types';
import { createAuthToken, importHMACKey, signHMAC, generateExtensionId } from './crypto';
import { DEFAULT_SETTINGS } from '../types';

class ExtensionAPIClient {
  private settings: ExtensionSettings = DEFAULT_SETTINGS;
  private hmacKey: CryptoKey | null = null;
  private authToken: string | null = null;
  private extensionId: string | null = null;

  async initialize(settings: Partial<ExtensionSettings> = {}): Promise<void> {
    this.settings = { ...this.settings, ...settings };
    this.extensionId = await this.getOrCreateExtensionId();
    
    if (this.settings.hmacKey) {
      this.hmacKey = await importHMACKey(this.settings.hmacKey);
    }
    
    await this.loadAuthToken();
  }

  private async getOrCreateExtensionId(): Promise<string> {
    const stored = await chrome.storage.local.get('extensionId');
    if (stored.extensionId) return stored.extensionId;
    
    const newId = generateExtensionId();
    await chrome.storage.local.set({ extensionId: newId });
    return newId;
  }

  private async loadAuthToken(): Promise<void> {
    const stored = await chrome.storage.local.get('authToken');
    if (stored.authToken) {
      this.authToken = stored.authToken;
    }
  }

  async setAuthToken(userId: string): Promise<void> {
    if (!this.hmacKey || !this.extensionId) throw new Error('HMAC key or extension ID not initialized');
    
    const payload: ExtensionAuthPayload = {
      userId,
      extensionId: this.extensionId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 * 30 // 30 days
    };
    
    this.authToken = createAuthToken(payload);
    await chrome.storage.local.set({ authToken: this.authToken });
  }

  clearAuthToken(): void {
    this.authToken = null;
    chrome.storage.local.remove('authToken');
  }

  private async signRequest(body: string): Promise<string> {
    if (!this.hmacKey) throw new Error('HMAC key not initialized');
    return signHMAC(body, this.hmacKey);
  }

  private getHeaders(body: string): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Extension-ID': this.extensionId || ''
    };
    
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    if (this.hmacKey) {
      headers['X-Signature'] = ''; // Will be filled by the caller after signing
    }
    
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.settings.apiBaseUrl}/api/extension${endpoint}`;
    const body = options.body ? JSON.stringify(options.body) : '';
    
    const headers = this.getHeaders(body) as Record<string, string>;
    
    if (this.hmacKey && body) {
      headers['X-Signature'] = await this.signRequest(body);
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      },
      body
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      const error: APIError = data;
      throw new Error(error.message || error.error || error.code || `HTTP ${response.status}`);
    }
    
    return data;
  }

  async saveJob(job: JobData, hrContacts?: HRContact[]): Promise<SaveJobResponse> {
    return this.request<SaveJobResponse>('/jobs', {
      method: 'POST',
      body: { job, hrContacts } as SaveJobRequest
    });
  }

  async autoSaveJobs(jobs: JobData[]): Promise<AutoSaveJobsResponse> {
    return this.request<AutoSaveJobsResponse>('/jobs/bulk', {
      method: 'POST',
      body: { jobs } as AutoSaveJobsRequest
    });
  }

  async lookupHRContacts(request: HRContactLookupRequest): Promise<HRContactLookupResponse> {
    return this.request<HRContactLookupResponse>('/hr-contacts', {
      method: 'POST',
      body: request
    });
  }

  async completeTask(taskId: string, taskName: string): Promise<TaskCompletionResponse> {
    return this.request<TaskCompletionResponse>('/tasks/complete', {
      method: 'POST',
      body: { taskId, taskName } as TaskCompletionRequest
    });
  }

  async getSettings(): Promise<ExtensionSettings> {
    return this.settings;
  }

  async updateSettings(settings: Partial<ExtensionSettings>): Promise<void> {
    this.settings = { ...this.settings, ...settings };
    await chrome.storage.local.set({ settings: this.settings });
  }

  isAuthenticated(): boolean {
    return !!this.authToken;
  }

  getExtensionId(): string | null {
    return this.extensionId;
  }
}

export const apiClient = new ExtensionAPIClient();