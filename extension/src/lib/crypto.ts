import type { ExtensionAuthPayload } from '../types';

const TEXT_ENCODER = new TextEncoder();

export async function importHMACKey(keyBase64: string): Promise<CryptoKey> {
  const keyBytes = base64ToUint8Array(keyBase64);
  return crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signHMAC(payload: string, key: CryptoKey): Promise<string> {
  const signature = await crypto.subtle.sign('HMAC', key, TEXT_ENCODER.encode(payload));
  return uint8ArrayToBase64(new Uint8Array(signature));
}

export async function verifyHMAC(payload: string, signatureBase64: string, key: CryptoKey): Promise<boolean> {
  const expectedSignature = await signHMAC(payload, key);
  return timingSafeEqual(expectedSignature, signatureBase64);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export function createAuthToken(payload: ExtensionAuthPayload): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}`;
}

export function parseAuthToken(token: string): ExtensionAuthPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}

export function generateExtensionId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function hashString(str: string): Promise<string> {
  const buffer = await crypto.subtle.digest('SHA-256', TEXT_ENCODER.encode(str));
  return uint8ArrayToBase64(new Uint8Array(buffer));
}