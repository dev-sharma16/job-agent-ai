import type { JobData } from '../types';

interface NaukriJobCard {
  jobId: string;
  title: string;
  company: string;
  location: string;
  url: string;
  description?: string;
  salary?: string;
  experience?: string;
  postedDate?: string;
}

class NaukriScraper {
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
    const jobCards = document.querySelectorAll<HTMLElement>('.jobTuple, .cust-job-tuple, .srp-jobtuple-wrapper, [data-job-id], .job-tuple');
    
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
      || card.querySelector('[data-job-id]')?.getAttribute('data-job-id')
      || card.getAttribute('job-id')
      || null;
  }

  private findButtonContainer(card: HTMLElement): HTMLElement | null {
    return card.querySelector('.job-tuple-footer, .job-actions, .mt-16, .d-flex.justify-content-between') as HTMLElement
      || card.querySelector('.job-title-wrap') as HTMLElement
      || card;
  }

  private createSaveButton(jobId: string, card: HTMLElement): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'autojob-save-btn btn btn-secondary';
    button.style.cssText = 'margin-left: 8px; padding: 8px 16px; font-size: 13px; display: inline-flex; align-items: center; gap: 6px;';
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
      </svg>
      <span>Save to autoJob</span>
    `;

    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      button.disabled = true;
      button.innerHTML = `
        <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <span>Saving...</span>
      `;
      
      try {
        const jobData = await this.extractJobData(card, jobId);
        if (jobData) {
          await chrome.runtime.sendMessage({
            type: 'SAVE_JOB',
            job: jobData
          });
          
          button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Saved!</span>
          `;
          button.classList.add('btn-success');
          button.classList.remove('btn-secondary');
          this.processedJobs.add(jobId);
        }
      } catch (error) {
        console.error('autoJob: Save failed', error);
        button.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <span>Failed</span>
        `;
        button.classList.add('btn-danger');
        button.classList.remove('btn-secondary');
        setTimeout(() => {
          button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>Save to autoJob</span>
          `;
          button.classList.remove('btn-danger');
          button.classList.add('btn-secondary');
          button.disabled = false;
        }, 3000);
      }
    });

    return button;
  }

  private async extractJobData(card: HTMLElement, jobId: string): Promise<JobData | null> {
    try {
      const titleEl = card.querySelector('.title, .job-title, a.title, h2 a') as HTMLElement;
      const companyEl = card.querySelector('.company, .subTitle, .company-name, .comp-name') as HTMLElement;
      const locationEl = card.querySelector('.location, .loc, .ellipsis, .fleft.grey-text') as HTMLElement;
      const salaryEl = card.querySelector('.salary, .sal, .ni-job-tuple-salary') as HTMLElement;
      const expEl = card.querySelector('.exp, .experience, .ni-job-tuple-exp') as HTMLElement;
      const linkEl = card.querySelector('a.title, a.job-title, .title a') as HTMLAnchorElement;

      const jobTitle = titleEl?.textContent?.trim() || '';
      const companyName = companyEl?.textContent?.trim() || '';
      const location = locationEl?.textContent?.trim() || '';
      const salary = salaryEl?.textContent?.trim();
      const experience = expEl?.textContent?.trim();
      const jobUrl = linkEl?.href || `https://www.naukri.com/job-listings-${jobId}`;

      if (!jobTitle || !companyName) return null;

      const description = await this.fetchJobDescription(jobUrl);

      return {
        originalId: jobId,
        jobSource: 'naukri',
        companyName,
        jobTitle,
        jobUrl,
        location,
        salaryRange: salary,
        jobDescription: description
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
      
      const descEl = doc.querySelector('.job-description, .JD, #jobDescription, .dang-inner-html');
      return descEl?.textContent?.trim().substring(0, 10000);
    } catch {
      return undefined;
    }
  }

  async scrapeCurrentPage(): Promise<JobData[]> {
    const jobs: JobData[] = [];
    const jobCards = document.querySelectorAll<HTMLElement>('.jobTuple, .cust-job-tuple, .srp-jobtuple-wrapper, [data-job-id], .job-tuple');
    
    for (const card of jobCards) {
      const jobId = this.extractJobId(card);
      if (jobId && !this.processedJobs.has(jobId)) {
        const jobData = await this.extractJobData(card, jobId);
        if (jobData) jobs.push(jobData);
      }
    }
    
    return jobs;
  }

  destroy(): void {
    this.observer?.disconnect();
    this.saveButtonsInjected = new WeakSet();
    this.processedJobs.clear();
  }
}

const scraper = new NaukriScraper();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => scraper.init());
} else {
  scraper.init();
}

export {};