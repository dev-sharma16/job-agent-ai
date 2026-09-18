# autoJob - AI-Powered Job Application Platform

A modern, full-stack job application platform built with Next.js 15, TypeScript, PostgreSQL, and AI integration. Migrated from PHP to a modern React/Next.js stack.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript (strict) |
| **Database** | Neon PostgreSQL (serverless) |
| **ORM** | Prisma |
| **Auth** | NextAuth.js v5 (Google, LinkedIn, Credentials) |
| **AI** | Google Gemini API (gemini-1.5-flash) |
| **Payments** | Razorpay (UPI, Cards, Wallets) |
| **Email** | Resend (transactional) |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | shadcn/ui + Radix UI |
| **State** | React Server Components + Server Actions |
| **Hosting** | Vercel (frontend) + Neon (DB) |

---

## Prerequisites

- Node.js 18+
- npm 9+
- Neon PostgreSQL database (free tier available at [neon.tech](https://neon.tech))
- Google Cloud Console project (for OAuth)
- LinkedIn Developer App (for OAuth)
- Google AI Studio API key (for Gemini)
- Razorpay account (for payments)
- Resend account (for emails)

---

## Environment Variables

Create `.env.local` in the project root with the following variables:

```env
# ============================================
# DATABASE (Neon PostgreSQL)
# ============================================
# Get from Neon Dashboard: https://console.neon.tech
# Format: postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/autojob?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/autojob?sslmode=require"

# ============================================
# NEXTAUTH.JS
# ============================================
NEXTAUTH_URL="http://localhost:3000"
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-32-char-secret-key-here"

# ============================================
# GOOGLE OAUTH
# ============================================
# 1. Go to https://console.cloud.google.com
# 2. Create project > APIs & Services > Credentials > OAuth 2.0 Client IDs
# 3. Authorized redirect URIs: http://localhost:3000/api/auth/callback/google
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# ============================================
# LINKEDIN OAUTH
# ============================================
# 1. Go to https://developer.linkedin.com
# 2. Create app > Products > Sign In with LinkedIn
# 3. Authorized redirect URLs: http://localhost:3000/api/auth/callback/linkedin
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"

# ============================================
# GOOGLE GEMINI AI
# ============================================
# Get from https://aistudio.google.com/apikey
GEMINI_API_KEY="your-gemini-api-key"

# ============================================
# RAZORPAY PAYMENTS
# ============================================
# Get from https://dashboard.razorpay.com/#/app/keys
RAZORPAY_KEY_ID="rzp_test_xxx"
RAZORPAY_KEY_SECRET="your-razorpay-secret"
# Webhook secret from Razorpay webhook settings
RAZORPAY_WEBHOOK_SECRET="your-webhook-secret"

# ============================================
# RESEND EMAIL
# ============================================
# Get from https://resend.com/api-keys
RESEND_API_KEY="re_xxx"
EMAIL_FROM="noreply@localhost"

# ============================================
# EXTENSION AUTH (Browser Extension)
# ============================================
# Generate secure random strings (32+ chars)
EXTENSION_HMAC_KEY="your-hmac-key-32-chars-minimum-length"
COOKIE_ENCRYPTION_KEY="your-32-char-encryption-key-here"
```

---

## Quick Start

### 1. Clone & Install

```bash
cd S:\ai-projects\job-apply-agent\job-apply-ai-agent
npm install
```

### 2. Configure Environment

```bash
# Copy example and edit with your credentials
cp .env.example .env.local
# Edit .env.local with your actual credentials
```

### 3. Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push

# Optional: Open Prisma Studio to view data
npx prisma studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
job-apply-ai-agent/
├── prisma/
│   └── schema.prisma          # Database schema (47 models)
├── src/
│   ├── app/
│   │   ├── (marketing)/       # Public pages (no auth)
│   │   │   ├── page.tsx       # Landing page
│   │   │   ├── login/         # Sign in page
│   │   │   ├── signup/        # Sign up page
│   │   │   ├── reset-password/# Password reset flow
│   │   │   ├── contact-us/    # Contact form
│   │   │   ├── privacy-policy/
│   │   │   ├── terms-condition/
│   │   │   └── refund-policy/
│   │   ├── (dashboard)/       # Protected pages (auth required)
│   │   │   ├── layout.tsx     # Dashboard layout + sidebar
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   ├── job-tracker/   # Kanban job tracker
│   │   │   ├── resume-builder/# AI resume builder
│   │   │   ├── practice-interview/ # Mock interviews
│   │   │   ├── linkedin-optimizer/ # LinkedIn optimization
│   │   │   ├── account/       # User settings
│   │   │   └── feedback/      # Feedback form
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/  # NextAuth endpoints
│   │   │   ├── auth/register/       # User registration
│   │   │   ├── auth/forgot-password/
│   │   │   ├── auth/reset-password/
│   │   │   └── contact/             # Contact form submission
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── middleware.ts      # Auth protection
│   │   └── providers.tsx
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── label.tsx
│   │   │   ├── textarea.tsx
│   │   │   └── select.tsx
│   │   ├── layout/            # Navbar, Footer
│   │   └── auth/              # LoginForm, SignupForm
│   └── lib/
│       ├── prisma.ts          # Prisma singleton
│       ├── auth.ts            # NextAuth config
│       ├── gemini.ts          # Gemini AI client
│       ├── razorpay.ts        # Razorpay config
│       ├── email.ts           # Resend email templates
│       ├── encryption.ts      # AES-256 encryption
│       ├── rate-limit.ts      # Rate limiting
│       └── utils.ts           # Helper functions
├── .env.example
├── .env.local
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## File-by-File Reference

### Root Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts (dev, build, start, lint), Prisma postinstall |
| `tsconfig.json` | TypeScript config (strict mode, path aliases `@/*`) |
| `next.config.ts` | Next.js config (headers for extension CORS, image domains) |
| `.env.example` | Template for environment variables |
| `.env.local` | Local development credentials (gitignored) |
| `.gitignore` | Excludes node_modules, .next, .env.local, prisma migrations |

### Prisma Database

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | **Complete database schema** - 47 models for users, jobs, resumes, interviews, payments, coins, tasks, OAuth, rate limits, emails |

### App Router - Layout & Providers

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout - font setup, Providers wrapper, global metadata |
| `src/app/providers.tsx` | Client component wrapping app with NextAuth `SessionProvider` |
| `src/app/globals.css` | Tailwind v4 imports, CSS variables for theming, global styles |
| `src/app/middleware.ts` | Auth protection - redirects unauthenticated users, allows public routes |
| `src/app/not-found.tsx` | Custom 404 page with navbar/footer |

### App Router - Public Pages `(marketing)/`

| File | Purpose |
|------|---------|
| `src/app/(marketing)/page.tsx` | **Landing page** - Hero, features, company marquee, stats, methodology, how-it-works |
| `src/app/(marketing)/login/page.tsx` | Login page - wraps `LoginForm` in Suspense |
| `src/app/(marketing)/login/actions.ts` | Server action for credentials login via NextAuth |
| `src/app/(marketing)/signup/page.tsx` | Signup page - wraps `SignupForm` in Suspense |
| `src/app/(marketing)/signup/actions.ts` | Server action for user registration + welcome email |
| `src/app/(marketing)/reset-password/page.tsx` | Password reset - email request + token verification |
| `src/app/(marketing)/reset-password/reset-password-form.tsx` | Client form for both forgot/reset flows |
| `src/app/(marketing)/contact-us/page.tsx` | Contact page with form |
| `src/app/(marketing)/contact-us/contact-form.tsx` | Client form component |
| `src/app/(marketing)/privacy-policy/page.tsx` | Static privacy policy page |
| `src/app/(marketing)/terms-condition/page.tsx` | Static terms of service page |
| `src/app/(marketing)/refund-policy/page.tsx` | Static refund policy page |

### App Router - Dashboard Pages `(dashboard)/`

| File | Purpose |
|------|---------|
| `src/app/(dashboard)/layout.tsx` | **Dashboard layout** - Sidebar nav, mobile drawer, user profile, logout |
| `src/app/(dashboard)/dashboard/page.tsx` | Main dashboard - welcome banner, stats cards, quick actions, getting started |
| `src/app/(dashboard)/job-tracker/page.tsx` | Job tracker placeholder (Kanban coming) |
| `src/app/(dashboard)/resume-builder/page.tsx` | Resume builder placeholder |
| `src/app/(dashboard)/practice-interview/page.tsx` | Practice interview placeholder |
| `src/app/(dashboard)/linkedin-optimizer/page.tsx` | LinkedIn optimizer placeholder |
| `src/app/(dashboard)/account/page.tsx` | Account settings - profile, password, connected accounts |
| `src/app/(dashboard)/feedback/page.tsx` | Feedback form - rating, reason, message |

### App Router - API Routes

| File | Purpose |
|------|---------|
| `src/app/api/auth/[...nextauth]/route.ts` | NextAuth.js handlers (GET/POST) |
| `src/app/api/auth/register/route.ts` | POST - Create user, UserCoins, UserStreak, send welcome email |
| `src/app/api/auth/forgot-password/route.ts` | POST - Generate reset token, send email (rate limited) |
| `src/app/api/auth/reset-password/route.ts` | POST - Verify token, hash new password, mark token used |
| `src/app/api/contact/route.ts` | POST - Save contact message to database |

### Components - UI Primitives (`components/ui/`)

| File | Purpose |
|------|---------|
| `button.tsx` | Button with variants (default, destructive, outline, secondary, ghost, link) + loading state |
| `input.tsx` | Styled input with focus states, disabled, error handling |
| `card.tsx` | Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter |
| `label.tsx` | Accessible label component |
| `textarea.tsx` | Styled textarea for multi-line input |
| `select.tsx` | Radix UI Select with Trigger, Content, Item, Label, Separator |

### Components - Layout (`components/layout/`)

| File | Purpose |
|------|---------|
| `navbar.tsx` | Responsive top nav - logo, links (public), auth buttons (login/signup or dashboard/logout) |
| `footer.tsx` | Site footer - product links, company, resources, copyright |

### Components - Auth (`components/auth/`)

| File | Purpose |
|------|---------|
| `login-form.tsx` | **Login form** - email/password, Google/LinkedIn OAuth buttons, forgot password link |
| `signup-form.tsx` | **Signup form** - name/email/password/confirm, OAuth buttons, terms checkbox |

### Lib - Core Utilities (`lib/`)

| File | Purpose |
|------|---------|
| `prisma.ts` | PrismaClient singleton (prevents multiple instances in dev) |
| `auth.ts` | **NextAuth v5 config** - Google, LinkedIn, Credentials providers, JWT callbacks, PrismaAdapter |
| `gemini.ts` | Google Generative AI client (gemini-1.5-flash) with rate-limited `callGemini()` |
| `razorpay.ts` | Razorpay instance + plan definitions (monthly/quarterly/yearly) + coin redemption config |
| `email.ts` | Resend client + HTML templates (welcome, reset password, membership) |
| `encryption.ts` | AES-256-CBC encrypt/decrypt for cookies/extension tokens |
| `rate-limit.ts` | DB-based rate limiter (bucket, hits, window, block duration) |
| `utils.ts` | Helpers: `cn()` (clsx+tailwind-merge), date formatting, truncate, stage/priority colors, initials |

---

## Key Implementation Details

### Authentication Flow
```
1. User visits /login or /signup
2. Credentials: POST to NextAuth /api/auth/callback/credentials
   → authorize() in auth.ts validates bcrypt password
   → Returns user object → JWT created
3. OAuth: Redirect to provider → callback to /api/auth/callback/{provider}
   → NextAuth handles token exchange → creates/updates Account + User
4. Session: JWT stored in httpOnly cookie (NextAuth default)
5. Middleware checks req.auth on protected routes
```

### Database Key Relations
```
User (1) ──< JobApplication (many)
User (1) ──< Resume (many)
User (1) ──< Interview (many)
User (1) ──< UserCoins (1)
User (1) ──< UserStreak (1)
User (1) ──< UserTask (many)
JobApplication (1) ──< JobSkill (many)
JobApplication (1) ──< Interview (many)
```

### Environment Setup Checklist
- [ ] `DATABASE_URL` - Neon PostgreSQL connection string
- [ ] `DIRECT_URL` - Same as DATABASE_URL for migrations
- [ ] `NEXTAUTH_SECRET` - Run `openssl rand -base64 32`
- [ ] `GOOGLE_CLIENT_ID/SECRET` - Google Cloud Console OAuth credentials
- [ ] `LINKEDIN_CLIENT_ID/SECRET` - LinkedIn Developer App credentials
- [ ] `GEMINI_API_KEY` - Google AI Studio API key
- [ ] `RAZORPAY_KEY_ID/SECRET` - Razorpay Dashboard test keys
- [ ] `RAZORPAY_WEBHOOK_SECRET` - From Razorpay webhook settings
- [ ] `RESEND_API_KEY` - Resend API key
- [ ] `EMAIL_FROM` - Verified sender domain in Resend
- [ ] `EXTENSION_HMAC_KEY` - 32+ char random string
- [ ] `COOKIE_ENCRYPTION_KEY` - 32 char hex string

---

## Features

### ✅ Implemented (Phase 1 - Foundation)

#### Public Pages
- **Landing Page** (`/`) - Full marketing page with:
  - Hero section with animated "Apply/Track/Grow" text
  - Google Sign-In button (when logged out)
  - Feature sections (AI Resume Builder, Job Tracker, Bookmark Jobs, AI Interview)
  - Company marquee (Amazon, BMW, Google, Bosch, P&G, L&T)
  - Stats cards (400% Salary Hike, 85% Time Saved, 63K Success Stories)
  - Proven Methodology section
  - Platform stats (487K+ Members, 1.6M+ Jobs, 689K+ Resumes)
  - How It Works (4-step process)
  - Responsive footer with links

- **Authentication**
  - **Login** (`/login`) - Email/password + Google OAuth + LinkedIn OAuth
  - **Signup** (`/signup`) - Name, email, password + OAuth options + terms checkbox
  - **Reset Password** (`/reset-password`) - Email request + token-based reset
  - Rate limiting on auth endpoints
  - JWT session strategy (stateless)

- **Legal Pages**
  - Privacy Policy (`/privacy-policy`)
  - Terms of Service (`/terms-condition`)
  - Refund Policy (`/refund-policy`)

- **Contact Us** (`/contact-us`) - Form with name, email, phone, message

#### Dashboard Pages (Auth Required)
- **Dashboard** (`/dashboard`) - Welcome banner, quick stats, quick actions, getting started guide
- **Job Tracker** (`/job-tracker`) - Kanban board placeholder
- **Resume Builder** (`/resume-builder`) - AI resume generation placeholder
- **Practice Interview** (`/practice-interview`) - Mock interview placeholder
- **LinkedIn Optimizer** (`/linkedin-optimizer`) - Profile analysis placeholder
- **Account** (`/account`) - Profile, password change, connected accounts
- **Feedback** (`/feedback`) - Rating, reason, message form

#### Technical Features
- **Middleware** - Route protection, public route allowlist, redirect logic
- **Database Schema** - 47 models covering users, jobs, resumes, interviews, payments, coins, tasks, etc.
- **UI Components** - Button, Input, Card, Label, Textarea, Select (shadcn/ui style)
- **Layout** - Responsive navbar, sidebar (mobile drawer), footer

---

### 🚧 Planned (Phase 2+)

#### Job Tracker (Kanban Board)
- Drag-and-drop columns: Bookmarked → Applying → Applied → Interviewing → Negotiating → Accepted/Rejected
- Pipeline count badges
- Job cards with company, title, priority, date, follow-up indicator
- Filter by stage, search by company/title
- Bulk actions (move, delete, archive)
- Add job modal (manual entry or paste URL)

#### Resume Builder
- Upload existing resume (PDF)
- AI Resume Builder (Gemini generates content)
- Resume data editor (personal, education, experience, skills, projects, certifications)
- Live preview panel
- Save to `ResumeData` table

#### Practice Interview
- Select job from tracker or enter JD manually
- Upload/paste resume
- AI formats JD + CV (via Gemini)
- Chat-based interview (questions + answers)
- Get feedback, score, strengths, improvements

#### AI Features (Gemini Integration)
- Resume generation from job description
- JD/CV formatting for interviews
- Mock interview questions & follow-ups
- Interview feedback & scoring
- LinkedIn profile optimization
- Keyword matching & ATS scoring

#### Browser Extension APIs
- Token-based auth (HMAC signed tokens)
- Save job from extension
- Auto-save scraped jobs
- HR contact lookup
- Task completion & coin rewards

#### Payments (Razorpay)
- Monthly (₹499), Quarterly (₹1,299), Yearly (₹3,999) plans
- Coin redemption (990 coins = 30 days premium)
- Webhook handling for async payment confirmation
- Premium membership activation

---

## Testing the Application

### 1. Test Landing Page
```bash
npm run dev
# Open http://localhost:3000
```
- Verify hero section loads
- Check feature sections render
- Test marquee animation
- Click "Sign Up" button → redirects to `/signup`

### 2. Test Authentication Flow

#### Signup
1. Go to `/signup`
2. Fill form: Name, Email, Password (8+ chars), Confirm Password
3. Check terms checkbox
4. Click "Create Account"
5. Should redirect to `/dashboard`
6. Check database: `npx prisma studio` → User table

#### Login
1. Go to `/login`
2. Use credentials from signup
3. Click "Sign In"
4. Should redirect to `/dashboard`

#### OAuth (requires real credentials)
1. Click "Continue with Google" on login/signup
2. Complete OAuth flow
3. Should redirect to `/dashboard`

#### Reset Password
1. Go to `/reset-password`
2. Enter email → "Send Reset Link"
3. Check email (or database: `PasswordReset` table)
4. Click link → enter new password
5. Login with new password

### 3. Test Dashboard
1. Login → redirected to `/dashboard`
2. Verify sidebar navigation works
3. Click each nav item → loads respective page
4. Test mobile: resize browser < 1024px → hamburger menu appears
5. Click logout → redirects to home

### 4. Test Contact Form
1. Go to `/contact-us`
2. Fill form and submit
2. Check database: `ContactMessage` table

### 5. Test API Endpoints

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123"}'

# Contact
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Hello"}'

# Forgot Password
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

## Database Schema Overview

### Core Models

| Model | Description |
|-------|-------------|
| `User` | Main user account with profile, auth, relations |
| `Account` | OAuth accounts (NextAuth adapter) |
| `Session` | User sessions (NextAuth adapter) |
| `JobApplication` | Job tracker entries (Kanban cards) |
| `JobSkill` | Skills attached to job applications |
| `Resume` | Uploaded resume files |
| `ResumeData` | Structured resume data (JSON) |
| `Interview` | Mock interview sessions |
| `FormattedJD` | AI-formatted job descriptions |
| `FormattedCV` | AI-formatted resumes |
| `UserCoins` | Gamification coins |
| `UserStreak` | Daily login streaks |
| `Task` / `UserTask` | Daily tasks system |
| `PremiumMembership` | Subscription status |
| `Transaction` | Payment records |
| `ContactMessage` | Contact form submissions |
| `Feedback` | User feedback |
| `PasswordReset` | Reset tokens |

### Key Relationships
- User → JobApplications (1:many)
- User → Resumes (1:many)
- User → Interviews (1:many)
- User → UserCoins (1:1)
- JobApplication → JobSkills (1:many)
- JobApplication → Interviews (1:many)

---

## Development Commands

```bash
# Development
npm run dev              # Start dev server (Turbopack)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npx prisma generate      # Generate Prisma client
npx prisma db push       # Push schema changes
npx prisma migrate dev   # Create migration
npx prisma studio        # Open DB GUI
npx prisma db seed       # Run seed script

# Type checking
npx tsc --noEmit         # Check types without build
```

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

```bash
# Build for production
npm run build
```

### Environment Variables for Production

Update these for production:
```env
NEXTAUTH_URL="https://your-domain.com"
# All OAuth redirect URIs must use production domain
# Database: Use Neon production connection string
```

---

## Troubleshooting

### Prisma Issues
```bash
# If schema changes don't reflect
npx prisma generate
npx prisma db push

# If migration issues
npx prisma migrate reset
```

### NextAuth Issues
- Ensure `NEXTAUTH_SECRET` is set (min 32 chars)
- Check OAuth redirect URIs match exactly
- Verify `NEXTAUTH_URL` matches your domain

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Type Errors
```bash
# Check types
npx tsc --noEmit
```

---

## Migration Notes

This project was migrated from a PHP codebase (`auto/` folder) with:
- MySQL → PostgreSQL
- PHP sessions → NextAuth JWT
- Server-rendered PHP → React Server Components
- External AI API → Google Gemini (self-hosted)
- Custom auth → NextAuth v5
- PHPMailer → Resend

See `migration-docs/` for detailed migration mapping.

---

## License

Private project - autoJob

---

## Support

For issues or questions:
- Check `migration-docs/` for implementation details
- Review Prisma schema for data model
- Check NextAuth docs for auth configuration
- See `src/lib/` for utility functions