import type { JobData } from '../types';

class AccentureScraper {
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
      if (message.type === 'SAVE_CURRENT_JOB') {
        this.saveCurrentJob().then(sendResponse);
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
      '[data-job-id], .job-card, .job-tile, .careers-job-card, .job-listing-item, .job-search-result'
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

    if (this.isJobDetailPage()) {
      this.injectDetailPageButton();
    }
  }

  private isJobDetailPage(): boolean {
    return window.location.pathname.includes('/jobdetails') || 
           window.location.pathname.includes('/job-detail') ||
           document.querySelector('[data-job-detail], .job-detail-page, .careers-job-detail') !== null;
  }

  private injectDetailPageButton(): void {
    if (document.querySelector('.autojob-save-btn-detail')) return;

    const jobId = this.extractJobIdFromUrl() || this.extractJobIdFromPage();
    if (!jobId || this.processedJobs.has(jobId)) return;

    const button = this.createSaveButton(jobId, document.body);
    button.classList.add('autojob-save-btn-detail');
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.zIndex = '9999';
    button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';

    document.body.appendChild(button);
  }

  private extractJobId(card: HTMLElement): string | null {
    return card.getAttribute('data-job-id')
      || card.getAttribute('data-jobid')
      || card.querySelector('[data-job-id]')?.getAttribute('data-job-id')
      || card.querySelector('[data-jobid]')?.getAttribute('data-jobid')
      || null;
  }

  private extractJobIdFromUrl(): string | null {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || params.get('jobId') || params.get('job_id');
  }

  private extractJobIdFromPage(): string | null {
    const metaId = document.querySelector('meta[name="job-id"], meta[property="job:id"]') as HTMLMetaElement;
    if (metaId?.content) return metaId.content;

    const jsonLd = document.querySelector('script[type="application/ld+json"]');
    if (jsonLd) {
      try {
        const data = JSON.parse(jsonLd.textContent || '{}');
        if (data.identifier) return data.identifier;
        if (data['@graph']) {
          for (const item of data['@graph']) {
            if (item.identifier) return item.identifier;
          }
        }
      } catch {}
    }

    return null;
  }

  private findButtonContainer(card: HTMLElement): HTMLElement | null {
    return card.querySelector('.job-card__actions, .job-tile__actions, .careers-job-card__actions, .job-listing__actions, .button-group, .actions') as HTMLElement
      || card.querySelector('.job-card__footer, .job-tile__footer, .careers-job-card__footer') as HTMLElement
      || card.querySelector('footer') as HTMLElement
      || card;
  }

  private createSaveButton(jobId: string, card: HTMLElement): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'autojob-save-btn';
    button.style.cssText = `
      margin-left: 8px; 
      padding: 8px 16px; 
      font-size: 13px; 
      display: inline-flex; 
      align-items: center; 
      gap: 6px; 
      background: #0d6efd; 
      color: white; 
      border: none; 
      border-radius: 4px; 
      cursor: pointer;
      font-family: inherit;
    `;
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
      let jobTitle = '';
      const companyName = 'Accenture';
      let location = '';
      let jobUrl = window.location.href;
      let jobDescription = '';
      let salaryRange = '';
      let postedDate = '';

      if (this.isJobDetailPage()) {
        const detailData = this.extractDetailPageData();
        jobTitle = detailData.title;
        location = detailData.location;
        jobDescription = detailData.description;
        salaryRange = detailData.salary;
        postedDate = detailData.postedDate;
      } else {
        const titleEl = card.querySelector('[data-test-job-title], .job-title, .job-card__title, .careers-job-card__title, h3, h2') as HTMLElement;
        const locationEl = card.querySelector('[data-test-job-location], .job-location, .job-card__location, .careers-job-card__location') as HTMLElement;
        const linkEl = card.querySelector('a[href*="/jobdetails"], a[href*="/job-detail"], a[href*="/careers/job"]') as HTMLAnchorElement;

        jobTitle = titleEl?.textContent?.trim() || '';
        location = locationEl?.textContent?.trim() || '';
        if (linkEl?.href) jobUrl = linkEl.href;

        if (jobUrl.includes('/jobdetails')) {
          jobDescription = await this.fetchJobDescription(jobUrl);
        }
      }

      if (!jobTitle) return null;

      return {
        originalId: jobId,
        jobSource: 'accenture' as JobSource,
        companyName,
        jobTitle,
        jobUrl,
        location,
        salaryRange: salaryRange || undefined,
        jobDescription: jobDescription || undefined,
        postedDate: postedDate || undefined
      };
    } catch (error) {
      console.error('autoJob: Failed to extract Accenture job data', error);
      return null;
    }
  }

  private extractDetailPageData(): { title: string; location: string; description: string; salary: string; postedDate: string } {
    let title = '';
    let location = '';
    let description = '';
    let salary = '';
    let postedDate = '';

    const titleEl = document.querySelector('[data-test-job-title], .job-detail__title, .careers-job-detail__title, h1') as HTMLElement;
    title = titleEl?.textContent?.trim() || '';

    const locationEl = document.querySelector('[data-test-job-location], .job-detail__location, .careers-job-detail__location, .job-location') as HTMLElement;
    location = locationEl?.textContent?.trim() || '';

    const descEl = document.querySelector('[data-test-job-description], .job-detail__description, .careers-job-detail__description, .job-description, .job-detail-content') as HTMLElement;
    description = descEl?.textContent?.trim().substring(0, 10000) || '';

    const salaryEl = document.querySelector('[data-test-job-salary], .job-detail__salary, .careers-job-detail__salary, .salary-range') as HTMLElement;
    salary = salaryEl?.textContent?.trim() || '';

    const dateEl = document.querySelector('[data-test-job-posted], .job-detail__posted-date, .careers-job-detail__posted-date, time[datetime]') as HTMLElement;
    postedDate = dateEl?.getAttribute('datetime') || dateEl?.textContent?.trim() || '';

    return { title, location, description, salary, postedDate };
  }

  private async fetchJobDescription(url: string): Promise<string | undefined> {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const descEl = doc.querySelector('[data-test-job-description], .job-detail__description, .careers-job-detail__description, .job-description, .job-detail-content');
      return descEl?.textContent?.trim().substring(0, 10000);
    } catch {
      return undefined;
    }
  }

  async scrapeCurrentPage(): Promise<JobData[]> {
    const jobs: JobData[] = [];

    if (this.isJobDetailPage()) {
      const jobId = this.extractJobIdFromUrl() || this.extractJobIdFromPage();
      if (jobId && !this.processedJobs.has(jobId)) {
        const jobData = await this.extractJobData(document.body, jobId);
        if (jobData) jobs.push(jobData);
      }
      return jobs;
    }

    const jobCards = document.querySelectorAll<HTMLElement>(
      '[data-job-id], .job-card, .job-tile, .careers-job-card, .job-listing-item, .job-search-result'
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

  async saveCurrentJob(): Promise<JobData | null> {
    if (this.isJobDetailPage()) {
      const jobId = this.extractJobIdFromUrl() || this.extractJobIdFromPage();
      if (jobId) {
        return await this.extractJobData(document.body, jobId);
      }
    }
    return null;
  }

  destroy(): void {
    this.observer?.disconnect();
    this.saveButtonsInjected = new WeakSet();
    this.processedJobs.clear();
  }
}

const scraper = new AccentureScraper();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => scraper.init());
} else {
  scraper.init();
}

export {};