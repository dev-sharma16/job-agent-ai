import type { JobData, HRContact } from '../types';

interface LinkedInJobCard {
  entityUrn: string;
  jobTitle: string;
  companyName: string;
  location: string;
  jobUrl: string;
  description?: string;
  postedTime?: string;
  salaryRange?: string;
  applicantsCount?: number;
  hiresNeeded?: number;
}

class LinkedInScraper {
  private observer: MutationObserver | null = null;
  private saveButtonsInjected = new WeakSet<HTMLElement>();
  private processedJobs = new Set<string>();

  init(): void {
    this.injectSaveButtons();
    this.observeDOMChanges();
    this.setupMessageListener();
  }

  private setupMessageListener(): void {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'SCRAPE_CURRENT_PAGE') {
        this.scrapeCurrentPage().then(sendResponse);
        return true;
      }
      if (message.type === 'GET_HR_CONTACTS') {
        this.getHRContacts(message.company, message.location).then(sendResponse);
        return true;
      }
    });
  }

  private observeDOMChanges(): void {
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          this.injectSaveButtons();
        }
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private injectSaveButtons(): void {
    const jobCards = document.querySelectorAll<HTMLElement>('[data-job-id], .job-card-container, .jobs-search-results__list-item, [data-occludable-job-id]');
    
    jobCards.forEach(card => {
      if (this.saveButtonsInjected.has(card)) return;
      
      const jobId = this.extractJobId(card);
      if (!jobId || this.processedJobs.has(jobId)) return;

      const existingButton = card.querySelector('.autojob-save-btn');
      if (existingButton) return;

      const button = this.createSaveButton(jobId, card);
      const container = this.findButtonContainer(card);
      if (container) {
        container.appendChild(button);
        this.saveButtonsInjected.add(card);
      }
    });
  }

  private extractJobId(card: HTMLElement): string | null {
    return card.getAttribute('data-job-id') 
      || card.getAttribute('data-occludable-job-id')
      || card.querySelector('[data-job-id]')?.getAttribute('data-job-id')
      || null;
  }

  private findButtonContainer(card: HTMLElement): HTMLElement | null {
    return card.querySelector('.job-card-container__footer, .jobs-search-results__list-item__actions, .job-card-list__footer, [data-test-job-card-footer]') as HTMLElement
      || card.querySelector('.artdeco-entity-lockup__caption') as HTMLElement
      || card;
  }

  private createSaveButton(jobId: string, card: HTMLElement): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'autojob-save-btn artdeco-button artdeco-button--muted artdeco-button--2 artdeco-button--secondary';
    button.innerHTML = `
      <span class="artdeco-button__icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
      </span>
      <span class="artdeco-button__text">Save to autoJob</span>
    `;
    button.style.marginLeft = '8px';
    button.style.fontSize = '13px';

    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      button.disabled = true;
      button.innerHTML = '<span class="artdeco-button__icon"><svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></span><span class="artdeco-button__text">Saving...</span>';
      
      try {
        const jobData = await this.extractJobData(card, jobId);
        if (jobData) {
          await chrome.runtime.sendMessage({
            type: 'SAVE_JOB',
            job: jobData
          });
          
          button.innerHTML = `
            <span class="artdeco-button__icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
            <span class="artdeco-button__text">Saved!</span>
          `;
          button.classList.add('artdeco-button--success');
          this.processedJobs.add(jobId);
        }
      } catch (error) {
        console.error('autoJob: Save failed', error);
        button.innerHTML = `
          <span class="artdeco-button__icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </span>
          <span class="artdeco-button__text">Failed</span>
        `;
        button.classList.add('artdeco-button--danger');
        setTimeout(() => {
          button.innerHTML = `
            <span class="artdeco-button__icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </span>
            <span class="artdeco-button__text">Save to autoJob</span>
          `;
          button.classList.remove('artdeco-button--danger');
          button.disabled = false;
        }, 3000);
      }
    });

    return button;
  }

  private async extractJobData(card: HTMLElement, jobId: string): Promise<JobData | null> {
    try {
      const titleEl = card.querySelector('[data-test-job-title], .job-card-list__title, .job-title, h3 a') as HTMLElement;
      const companyEl = card.querySelector('[data-test-job-company], .job-card-container__company-name, .job-company') as HTMLElement;
      const locationEl = card.querySelector('[data-test-job-location], .job-card-container__metadata-item, .job-location') as HTMLElement;
      const linkEl = card.querySelector('a[href*="/jobs/view/"]') as HTMLAnchorElement;

      const jobTitle = titleEl?.textContent?.trim() || '';
      const companyName = companyEl?.textContent?.trim() || '';
      const location = locationEl?.textContent?.trim() || '';
      const jobUrl = linkEl?.href || `https://www.linkedin.com/jobs/view/${jobId}`;

      if (!jobTitle || !companyName) return null;

      const description = await this.fetchJobDescription(jobUrl);

      return {
        originalId: jobId,
        jobSource: 'linkedin',
        companyName,
        jobTitle,
        jobUrl,
        location,
        jobDescription: description,
        postedDate: this.extractPostedDate(card)
      };
    } catch (error) {
      console.error('autoJob: Failed to extract job data', error);
      return null;
    }
  }

  private async fetchJobDescription(url: string): Promise<string | undefined> {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const descEl = doc.querySelector('.jobs-description__content, .job-details-jobs-unified-top-card__job-description, #job-details');
      return descEl?.textContent?.trim().substring(0, 10000);
    } catch {
      return undefined;
    }
  }

  private extractPostedDate(card: HTMLElement): string | undefined {
    const timeEl = card.querySelector('time, [datetime]') as HTMLElement;
    return timeEl?.getAttribute('datetime') || timeEl?.textContent?.trim();
  }

  async scrapeCurrentPage(): Promise<JobData[]> {
    const jobs: JobData[] = [];
    const jobCards = document.querySelectorAll<HTMLElement>('[data-job-id], .job-card-container, .jobs-search-results__list-item, [data-occludable-job-id]');
    
    for (const card of jobCards) {
      const jobId = this.extractJobId(card);
      if (jobId && !this.processedJobs.has(jobId)) {
        const jobData = await this.extractJobData(card, jobId);
        if (jobData) jobs.push(jobData);
      }
    }
    
    return jobs;
  }

  async getHRContacts(company: string, location?: string): Promise<HRContact[]> {
    try {
      const response = await fetch(`${this.getApiBase()}/api/extension/hr-contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, location })
      });
      const data = await response.json();
      return data.contacts || [];
    } catch {
      return [];
    }
  }

  private getApiBase(): string {
    return 'http://localhost:3000';
  }

  destroy(): void {
    this.observer?.disconnect();
    this.saveButtonsInjected = new WeakSet();
    this.processedJobs.clear();
  }
}

const scraper = new LinkedInScraper();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => scraper.init());
} else {
  scraper.init();
}

export {};