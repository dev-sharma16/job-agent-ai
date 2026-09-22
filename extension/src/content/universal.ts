import type { JobData } from '../types';

interface JobCardSelectors {
  container: string[];
  title: string[];
  company: string[];
  location: string[];
  link: string[];
  description: string[];
  salary: string[];
  date: string[];
  idAttr: string[];
}

const UNIVERSAL_SELECTORS: JobCardSelectors = {
  container: [
    '[data-job-id]', '[data-jobid]', '[data-jk]', '[data-occludable-job-id]',
    '.job-card', '.job-tile', '.job-listing', '.job-item', '.job-result',
    '.careers-job-card', '.job-search-result', '.job-card-container',
    '.jobs-search-results__list-item', '.job-seen-beacon', '.resultContent',
    '.tapItem', '.slider_item', '.jobTuple', '.cust-job-tuple',
    '.srp-jobtuple-wrapper', '.job-tuple', 'article[data-testid*="job"]',
    '[class*="job-card"]', '[class*="job-tile"]', '[class*="job-listing"]',
    '[class*="career-job"]', '[class*="position-card"]', '[class*="vacancy-card"]',
    'li[class*="job"]', 'div[class*="job"][class*="card"]'
  ],
  title: [
    '[data-test-job-title]', '[data-testid*="title"]', '.job-title', '.job-card__title',
    '.careers-job-card__title', '.position-title', '.vacancy-title',
    'h3 a', 'h2 a', 'h3', 'h2', '.title a', '.title',
    '[class*="title"]:not([class*="company"]):not([class*="location"])'
  ],
  company: [
    '[data-test-job-company]', '[data-testid*="company"]', '.company-name',
    '.job-company', '.job-card__company', '.careers-job-card__company',
    '.employer-name', '.organization-name', '[class*="company"]',
    '[class*="employer"]', '[class*="organization"]'
  ],
  location: [
    '[data-test-job-location]', '[data-testid*="location"]', '.job-location',
    '.job-card__location', '.careers-job-card__location', '.location',
    '[class*="location"]', '.job-meta [class*="location"]'
  ],
  link: [
    'a[href*="/job"]', 'a[href*="/career"]', 'a[href*="/position"]',
    'a[href*="/vacancy"]', 'a[href*="/apply"]', 'a[href*="/jobs/"]',
    'a[data-test-job-title]', 'a[class*="title"]', 'h3 a', 'h2 a'
  ],
  description: [
    '[data-test-job-description]', '.job-description', '.job-card__description',
    '.careers-job-card__description', '.job-snippet', '.description',
    '[class*="description"]', '[class*="snippet"]'
  ],
  salary: [
    '[data-test-job-salary]', '[data-testid*="salary"]', '.salary',
    '.job-salary', '.salary-range', '.compensation', '.pay-range',
    '[class*="salary"]', '[class*="compensation"]'
  ],
  date: [
    '[data-test-job-posted]', '[data-testid*="date"]', 'time[datetime]',
    '.posted-date', '.job-date', '.date-posted', '[class*="date"]',
    '[class*="posted"]'
  ],
  idAttr: [
    'data-job-id', 'data-jobid', 'data-jk', 'data-occludable-job-id',
    'data-id', 'id', 'data-job-key', 'data-position-id'
  ]
};

class UniversalScraper {
  private observer: MutationObserver | null = null;
  private saveButtonsInjected = new WeakSet<HTMLElement>();
  private processedJobs = new Set<string>();
  private isInitialized = false;

  init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;
    
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
      let shouldInject = false;
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as HTMLElement;
              if (el.querySelector && this.looksLikeJobContainer(el)) {
                shouldInject = true;
                break;
              }
            }
          }
        }
      }
      if (shouldInject) {
        setTimeout(() => this.injectSaveButtons(), 100);
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private looksLikeJobContainer(element: HTMLElement): boolean {
    const text = element.textContent?.toLowerCase() || '';
    const jobKeywords = ['job', 'position', 'career', 'vacancy', 'opening', 'role', 'apply'];
    return jobKeywords.some(kw => text.includes(kw)) && 
           (element.querySelector('a[href]') || element.querySelector('h3, h2, .title'));
  }

  private injectSaveButtons(): void {
    const jobCards = this.findJobCards();
    
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

  private findJobCards(): HTMLElement[] {
    const cards: HTMLElement[] = [];
    
    for (const selector of UNIVERSAL_SELECTORS.container) {
      try {
        const elements = document.querySelectorAll<HTMLElement>(selector);
        elements.forEach(el => {
          if (this.isValidJobCard(el)) {
            cards.push(el);
          }
        });
      } catch {}
    }

    return this.deduplicateCards(cards);
  }

  private isValidJobCard(element: HTMLElement): boolean {
    const text = element.textContent?.trim() || '';
    if (text.length < 10 || text.length > 5000) return false;
    
    const hasTitle = UNIVERSAL_SELECTORS.title.some(sel => 
      element.querySelector(sel)?.textContent?.trim()
    );
    const hasLink = element.querySelector('a[href]');
    
    return hasTitle && !!hasLink;
  }

  private deduplicateCards(cards: HTMLElement[]): HTMLElement[] {
    const seen = new Set<string>();
    return cards.filter(card => {
      const key = this.getCardKey(card);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private getCardKey(card: HTMLElement): string {
    const id = this.extractJobId(card);
    if (id) return id;
    
    const title = card.querySelector(UNIVERSAL_SELECTORS.title.join(', '))?.textContent?.trim() || '';
    const company = card.querySelector(UNIVERSAL_SELECTORS.company.join(', '))?.textContent?.trim() || '';
    const href = card.querySelector('a[href]')?.getAttribute('href') || '';
    return `${title}|${company}|${href}`.substring(0, 200);
  }

  private extractJobId(card: HTMLElement): string | null {
    for (const attr of UNIVERSAL_SELECTORS.idAttr) {
      const value = card.getAttribute(attr);
      if (value && value.length > 0 && value.length < 100) {
        return value;
      }
    }
    
    const link = card.querySelector('a[href]') as HTMLAnchorElement;
    if (link?.href) {
      const url = new URL(link.href, window.location.origin);
      const params = ['id', 'jobId', 'job_id', 'positionId', 'jk', 'jobkey'];
      for (const param of params) {
        const value = url.searchParams.get(param);
        if (value) return value;
      }
      
      const pathParts = url.pathname.split('/');
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart && lastPart.length > 3 && lastPart.length < 100) {
        return lastPart;
      }
    }
    
    return null;
  }

  private findButtonContainer(card: HTMLElement): HTMLElement | null {
    const containerSelectors = [
      '.job-card__actions', '.job-tile__actions', '.careers-job-card__actions',
      '.job-actions', '.job-card-footer', '.job-tile-footer',
      '.button-group', '.actions', 'footer', '.job-meta',
      '[class*="action"]', '[class*="button"]'
    ];
    
    for (const sel of containerSelectors) {
      const container = card.querySelector(sel) as HTMLElement;
      if (container && container.offsetWidth > 0) return container;
    }
    
    const titleEl = card.querySelector(UNIVERSAL_SELECTORS.title.join(', ')) as HTMLElement;
    if (titleEl?.parentElement) return titleEl.parentElement;
    
    return card;
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
      white-space: nowrap;
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

  private isJobDetailPage(): boolean {
    const path = window.location.pathname.toLowerCase();
    const detailPatterns = [
      '/jobdetail', '/job-detail', '/jobdetails', '/position/', '/vacancy/',
      '/careers/job', '/careers/position', '/jobs/view/', '/job/'
    ];
    return detailPatterns.some(p => path.includes(p)) ||
           document.querySelector('[data-job-detail], .job-detail-page, .careers-job-detail, .job-detail, [class*="job-detail"]') !== null;
  }

  private injectDetailPageButton(): void {
    if (document.querySelector('.autojob-save-btn-detail')) return;

    const jobId = this.extractJobIdFromUrl() || this.extractJobIdFromPage() || this.generateJobId();
    if (this.processedJobs.has(jobId)) return;

    const button = this.createSaveButton(jobId, document.body);
    button.classList.add('autojob-save-btn-detail');
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.zIndex = '9999';
    button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    button.style.maxWidth = '200px';

    document.body.appendChild(button);
  }

  private extractJobIdFromUrl(): string | null {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || params.get('jobId') || params.get('job_id') || 
           params.get('positionId') || params.get('jk') || params.get('jobkey');
  }

  private extractJobIdFromPage(): string | null {
    const metaId = document.querySelector('meta[name="job-id"], meta[property="job:id"], meta[name="position-id"]') as HTMLMetaElement;
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

  private generateJobId(): string {
    return `universal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async extractJobData(card: HTMLElement, jobId: string): Promise<JobData | null> {
    try {
      let jobTitle = '';
      let companyName = '';
      let location = '';
      let jobUrl = window.location.href;
      let jobDescription = '';
      let salaryRange = '';
      let postedDate = '';

      if (this.isJobDetailPage()) {
        const detailData = this.extractDetailPageData();
        jobTitle = detailData.title;
        companyName = detailData.company;
        location = detailData.location;
        jobDescription = detailData.description;
        salaryRange = detailData.salary;
        postedDate = detailData.postedDate;
      } else {
        const titleEl = card.querySelector(UNIVERSAL_SELECTORS.title.join(', ')) as HTMLElement;
        const companyEl = card.querySelector(UNIVERSAL_SELECTORS.company.join(', ')) as HTMLElement;
        const locationEl = card.querySelector(UNIVERSAL_SELECTORS.location.join(', ')) as HTMLElement;
        const linkEl = card.querySelector('a[href]') as HTMLAnchorElement;

        jobTitle = titleEl?.textContent?.trim() || '';
        companyName = companyEl?.textContent?.trim() || this.extractCompanyFromDomain();
        location = locationEl?.textContent?.trim() || '';
        
        if (linkEl?.href) {
          jobUrl = linkEl.href;
        } else {
          const anyLink = card.querySelector('a[href]') as HTMLAnchorElement;
          if (anyLink?.href) jobUrl = anyLink.href;
        }

        if (jobUrl.includes('/job') || jobUrl.includes('/career') || jobUrl.includes('/position')) {
          jobDescription = await this.fetchJobDescription(jobUrl);
        }
      }

      if (!jobTitle) return null;

      const source = this.detectJobSource();

      return {
        originalId: jobId,
        jobSource: source,
        companyName: companyName || this.extractCompanyFromDomain(),
        jobTitle,
        jobUrl,
        location: location || undefined,
        salaryRange: salaryRange || undefined,
        jobDescription: jobDescription || undefined,
        postedDate: postedDate || undefined
      };
    } catch (error) {
      console.error('autoJob: Failed to extract job data', error);
      return null;
    }
  }

  private extractDetailPageData(): { title: string; company: string; location: string; description: string; salary: string; postedDate: string } {
    let title = '';
    let company = '';
    let location = '';
    let description = '';
    let salary = '';
    let postedDate = '';

    const titleSelectors = [
      '[data-test-job-title]', '.job-detail__title', '.careers-job-detail__title',
      '.job-title', '.position-title', 'h1[class*="title"]', 'h1'
    ];
    const titleEl = document.querySelector(titleSelectors.join(', ')) as HTMLElement;
    title = titleEl?.textContent?.trim() || '';

    const companySelectors = [
      '[data-test-job-company]', '.job-detail__company', '.careers-job-detail__company',
      '.company-name', '.employer-name', '[class*="company"]'
    ];
    const companyEl = document.querySelector(companySelectors.join(', ')) as HTMLElement;
    company = companyEl?.textContent?.trim() || this.extractCompanyFromDomain();

    const locationSelectors = [
      '[data-test-job-location]', '.job-detail__location', '.careers-job-detail__location',
      '.job-location', '.location', '[class*="location"]'
    ];
    const locationEl = document.querySelector(locationSelectors.join(', ')) as HTMLElement;
    location = locationEl?.textContent?.trim() || '';

    const descSelectors = [
      '[data-test-job-description]', '.job-detail__description', '.careers-job-detail__description',
      '.job-description', '.job-detail-content', '.description', '[class*="description"]'
    ];
    const descEl = document.querySelector(descSelectors.join(', ')) as HTMLElement;
    description = descEl?.textContent?.trim().substring(0, 10000) || '';

    const salarySelectors = [
      '[data-test-job-salary]', '.job-detail__salary', '.careers-job-detail__salary',
      '.salary-range', '.salary', '.compensation', '[class*="salary"]'
    ];
    const salaryEl = document.querySelector(salarySelectors.join(', ')) as HTMLElement;
    salary = salaryEl?.textContent?.trim() || '';

    const dateSelectors = [
      '[data-test-job-posted]', '.job-detail__posted-date', '.careers-job-detail__posted-date',
      'time[datetime]', '.posted-date', '[class*="date"]'
    ];
    const dateEl = document.querySelector(dateSelectors.join(', ')) as HTMLElement;
    postedDate = dateEl?.getAttribute('datetime') || dateEl?.textContent?.trim() || '';

    return { title, company, location, description, salary, postedDate };
  }

  private extractCompanyFromDomain(): string {
    const hostname = window.location.hostname.replace('www.', '');
    const knownCompanies: Record<string, string> = {
      'accenture.com': 'Accenture',
      'linkedin.com': 'LinkedIn',
      'indeed.com': 'Indeed',
      'naukri.com': 'Naukri',
      'glassdoor.com': 'Glassdoor',
      'monster.com': 'Monster',
      'dice.com': 'Dice',
      'wellfound.com': 'Wellfound',
      'angel.co': 'AngelList',
      'lever.co': 'Lever',
      'greenhouse.io': 'Greenhouse',
      'workday.com': 'Workday',
      'icims.com': 'iCIMS',
      'smartrecruiters.com': 'SmartRecruiters',
      'bamboohr.com': 'BambooHR',
      'jobvite.com': 'Jobvite',
      'taleo.net': 'Taleo',
      'oraclecloud.com': 'Oracle',
      'successfactors.com': 'SAP SuccessFactors',
      'workable.com': 'Workable',
      'recruitee.com': 'Recruitee',
      'personio.de': 'Personio',
      'teamtailor.com': 'Teamtailor',
      'ashbyhq.com': 'Ashby',
      'join.com': 'Join',
      'welcometothejungle.com': 'Welcome to the Jungle'
    };
    
    for (const [domain, name] of Object.entries(knownCompanies)) {
      if (hostname.includes(domain)) return name;
    }
    
    return hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1);
  }

  private detectJobSource(): JobData['jobSource'] {
    const hostname = window.location.hostname;
    if (hostname.includes('linkedin.com')) return 'linkedin';
    if (hostname.includes('indeed.com')) return 'indeed';
    if (hostname.includes('naukri.com')) return 'naukri';
    if (hostname.includes('accenture.com')) return 'accenture';
    return 'other';
  }

  private async fetchJobDescription(url: string): Promise<string | undefined> {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const descSelectors = [
        '[data-test-job-description]', '.job-detail__description', '.careers-job-detail__description',
        '.job-description', '.job-detail-content', '.description', '#jobDescription',
        '.jobsearch-jobDescriptionText', '.jobs-description__content', '.JD',
        '[class*="description"]', '[class*="job-detail"]'
      ];
      
      for (const sel of descSelectors) {
        const el = doc.querySelector(sel);
        if (el?.textContent?.trim()) {
          return el.textContent.trim().substring(0, 10000);
        }
      }
    } catch {}
    return undefined;
  }

  async scrapeCurrentPage(): Promise<JobData[]> {
    const jobs: JobData[] = [];

    if (this.isJobDetailPage()) {
      const jobId = this.extractJobIdFromUrl() || this.extractJobIdFromPage() || this.generateJobId();
      if (!this.processedJobs.has(jobId)) {
        const jobData = await this.extractJobData(document.body, jobId);
        if (jobData) jobs.push(jobData);
      }
      return jobs;
    }

    const jobCards = this.findJobCards();
    
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
      const jobId = this.extractJobIdFromUrl() || this.extractJobIdFromPage() || this.generateJobId();
      return await this.extractJobData(document.body, jobId);
    }
    return null;
  }

  destroy(): void {
    this.observer?.disconnect();
    this.saveButtonsInjected = new WeakSet();
    this.processedJobs.clear();
    this.isInitialized = false;
  }
}

const scraper = new UniversalScraper();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => scraper.init());
} else {
  scraper.init();
}

export {};