import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { importHMACKey, verifyHMAC } from '@/lib/encryption';

interface ExtensionAuthPayload {
  userId: string;
  extensionId: string;
  iat: number;
  exp: number;
}

export async function verifyExtensionAuth(request: NextRequest): Promise<ExtensionAuthPayload | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    const extensionId = request.headers.get('X-Extension-ID');
    const signature = request.headers.get('X-Signature');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    if (!extensionId) {
      return null;
    }

    const token = authHeader.substring(7);
    const payload = parseAuthToken(token);
    
    if (!payload) {
      return null;
    }

    if (payload.extensionId !== extensionId) {
      return null;
    }

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, extensionId: true, status: true }
    });

    if (!user || user.status === 0) {
      return null;
    }

    if (user.extensionId && user.extensionId !== extensionId) {
      return null;
    }

    if (signature) {
      const body = await request.text();
      const hmacKey = process.env.EXTENSION_HMAC_KEY;
      
      if (hmacKey) {
        const key = await importHMACKey(hmacKey);
        const isValid = await verifyHMAC(body, signature, key);
        if (!isValid) {
          return null;
        }
      }
    }

    return payload;
  } catch {
    return null;
  }
}

function parseAuthToken(token: string): ExtensionAuthPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}

export function extractExtensionAuth(request: NextRequest): { extensionId: string | null; token: string | null } {
  const authHeader = request.headers.get('Authorization');
  const extensionId = request.headers.get('X-Extension-ID');
  
  return {
    extensionId,
    token: authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null
  };
}