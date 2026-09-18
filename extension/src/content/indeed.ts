import type { JobData } from '../types';

interface IndeedJobCard {
  jobId: string;
  title: string;
  company: string;
  location: string;
  url: string;
  description?: string;
  salary?: string;
  postedDate?: string;
}

class IndeedScraper {
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
    const jobCards = document.querySelectorAll<HTMLElement>(
      '.job_seen_beacon, .resultContent, .tapItem, [data-jk], .slider_item, .jobsearch-SerpJobCard, .job_card'
    );
    
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
    return card.getAttribute('data-jk')
      || card.querySelector('[data-jk]')?.getAttribute('data-jk')
      || card.getAttribute('id')?.replace('job_', '')
      || null;
  }

  private findButtonContainer(card: HTMLElement): HTMLElement | null {
    return card.querySelector('.jobCardFooter, .jobCardFooterContainer, .result-footer, .metadata, .jobCardShelfContainer') as HTMLElement
      || card.querySelector('.heading4, .jobTitle') as HTMLElement
      || card;
  }

  private createSaveButton(jobId: string, card: HTMLElement): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'autojob-save-btn';
    button.style.cssText = 'margin-left: 8px; padding: 8px 16px; font-size: 13px; display: inline-flex; align-items: center; gap: 6px; background: #0d6efd; color: white; border: none; border-radius: 4px; cursor: pointer;';
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
          button.style.background = '#198754';
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
        button.style.background = '#dc3545';
        setTimeout(() => {
          button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>Save to autoJob</span>
          `;
          button.style.background = '#0d6efd';
          button.disabled = false;
        }, 3000);
      }
    });

    return button;
  }

  private async extractJobData(card: HTMLElement, jobId: string): Promise<JobData | null> {
    try {
      const titleEl = card.querySelector('[data-testid="job-title"], .jobTitle, h2 a, .title a') as HTMLElement;
      const companyEl = card.querySelector('[data-testid="company-name"], .companyName, .company_location .companyName') as HTMLElement;
      const locationEl = card.querySelector('[data-testid="job-location"], .companyLocation, .location') as HTMLElement;
      const salaryEl = card.querySelector('[data-testid="salary"], .salary-snippet, .estimatedSalary') as HTMLElement;
      const linkEl = card.querySelector('a[data-testid="job-title"], .jobTitle a, .title a') as HTMLAnchorElement;

      const jobTitle = titleEl?.textContent?.trim() || '';
      const companyName = companyEl?.textContent?.trim() || '';
      const location = locationEl?.textContent?.trim() || '';
      const salary = salaryEl?.textContent?.trim();
      const jobUrl = linkEl?.href || `https://www.indeed.com/viewjob?jk=${jobId}`;

      if (!jobTitle || !companyName) return null;

      const description = await this.fetchJobDescription(jobUrl);

      return {
        originalId: jobId,
        jobSource: 'indeed',
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
      
      const descEl = doc.querySelector('#jobDescriptionText, .jobsearch-jobDescriptionText, .job-description');
      return descEl?.textContent?.trim().substring(0, 10000);
    } catch {
      return undefined;
    }
  }

  async scrapeCurrentPage(): Promise<JobData[]> {
    const jobs: JobData[] = [];
    const jobCards = document.querySelectorAll<HTMLElement>(
      '.job_seen_beacon, .resultContent, .tapItem, [data-jk], .slider_item, .jobsearch-SerpJobCard, .job_card'
    );
    
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

const scraper = new IndeedScraper();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => scraper.init());
} else {
  scraper.init();
}

export {};