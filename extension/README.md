# autoJob Browser Extension

Browser extension for saving jobs from LinkedIn, Naukri, and Indeed with one click. Syncs with your autoJob dashboard.

## Features

- **One-click job saving** - Click "Save to autoJob" on any job listing
- **Auto-save all jobs on page** - Bulk save all visible jobs
- **HR contact lookup** - Find hiring managers for companies
- **Offline queue** - Jobs saved offline sync when you're back online
- **Coin rewards** - Earn coins for saving jobs and completing tasks
- **Dashboard sync** - All jobs appear in your autoJob Kanban board

## Supported Sites

- LinkedIn Jobs (`linkedin.com/jobs/*`)
- Naukri (`naukri.com/*`)
- Indeed (`indeed.com/*`)

## Installation

### Development

1. Build the extension:
   ```bash
   cd extension
   npm install
   npm run build
   ```

2. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `extension/dist` folder

3. Set up environment:
   - Copy `.env.example` to `.env.local` in the main project
   - Add `EXTENSION_HMAC_KEY` and `COOKIE_ENCRYPTION_KEY`
   - Run the main app: `npm run dev`

### Production

1. Build for production:
   ```bash
   cd extension
   npm run build
   npm run zip
   ```

2. Submit `autojob-extension.zip` to Chrome Web Store

## Usage

1. Click the autoJob extension icon in your toolbar
2. Click "Sign In to autoJob" to connect your account
3. Browse job sites (LinkedIn, Naukri, Indeed)
4. Click "Save to autoJob" on any job card
5. Or click "Auto-Save All Jobs on Page" to save everything
6. View saved jobs in your autoJob dashboard

## Architecture

```
extension/
├── manifest.json           # Manifest V3 config
├── src/
│   ├── background/         # Service worker (auth, sync, alarms)
│   ├── content/            # Content scripts per site
│   │   ├── linkedin.ts     # LinkedIn job scraper
│   │   ├── naukri.ts       # Naukri job scraper
│   │   └── indeed.ts       # Indeed job scraper
│   ├── popup/              # Extension popup UI
│   ├── lib/                # Shared utilities
│   │   ├── api.ts          # API client with HMAC auth
│   │   ├── crypto.ts       # HMAC signing/verification
│   │   └── storage.ts      # Chrome storage helpers
│   └── types/              # TypeScript types
└── dist/                   # Built extension (generated)
```

## API Endpoints (Next.js)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/extension/jobs` | POST | Save single job |
| `/api/extension/jobs/bulk` | POST | Bulk save jobs |
| `/api/extension/hr-contacts` | POST | Lookup HR contacts |
| `/api/extension/tasks/complete` | POST | Complete task, earn coins |
| `/api/extension/stats` | GET | Get user stats |
| `/api/extension/auth` | POST | Register extension ID |

## Authentication

The extension uses HMAC-signed JWT tokens for authentication:

1. User logs in on the web app
2. Extension receives `userId` and generates HMAC token
3. All API requests include `Authorization: Bearer <token>` and `X-Signature`
4. Server verifies HMAC using `EXTENSION_HMAC_KEY`

## Environment Variables

```env
# Main app .env.local
EXTENSION_HMAC_KEY=your-base64-encoded-32-byte-key
COOKIE_ENCRYPTION_KEY=your-32-char-hex-key
```

Generate keys:
```bash
# HMAC key (base64)
openssl rand -base64 32

# Encryption key (hex)
openssl rand -hex 32
```

## Development Tips

- Content scripts run in page context, background runs in service worker
- Use `chrome.runtime.sendMessage` for communication
- Check `chrome://extensions/` for console logs
- Content script selectors may need updates when sites change

## Troubleshooting

**Jobs not saving?**
- Check you're logged in (extension popup shows "Connected")
- Verify site is supported (LinkedIn/Naukri/Indeed job listing pages)
- Check browser console for errors

**Auth not working?**
- Ensure `EXTENSION_HMAC_KEY` matches in `.env.local`
- Clear extension storage: `chrome.storage.local.clear()`
- Re-login from extension popup

**Selectors broken?**
- Sites update their DOM frequently
- Update selectors in `src/content/*.ts`
- Test with `npm run build` and reload extension