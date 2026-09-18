import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const isExtension = searchParams.get('extension') === 'true';
  
  const session = await auth();
  
  if (isExtension && session?.user) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>autoJob - Authentication Successful</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f9fafb; }
          .container { text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
          .icon { width: 64px; height: 64px; margin: 0 auto 24px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
          .icon svg { width: 32px; height: 32px; color: white; }
          h1 { color: #1f2937; margin-bottom: 8px; }
          p { color: #6b7280; margin-bottom: 24px; }
          .close-btn { background: #667eea; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h1>Authentication Successful!</h1>
          <p>You're now connected to autoJob. This window will close automatically.</p>
          <button class="close-btn" onclick="window.close()">Close Window</button>
        </div>
        <script>
          if (window.opener) {
            window.opener.postMessage({
              type: 'AUTOJOB_AUTH_SUCCESS',
              userId: '${session.user.id}'
            }, '*');
          }
          setTimeout(() => window.close(), 3000);
        </script>
      </body>
      </html>
    `;
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
  }
  
  return NextResponse.redirect(new URL('/dashboard', request.url));
}