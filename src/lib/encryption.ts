import crypto from "crypto"

const ENCRYPTION_KEY = process.env.COOKIE_ENCRYPTION_KEY!
const IV_LENGTH = 16

export function encryptData(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY, "hex"), iv)
  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")
  return iv.toString("hex") + ":" + encrypted
}

export function decryptData(text: string): string {
  const parts = text.split(":")
  const iv = Buffer.from(parts[0], "hex")
  const encryptedText = parts[1]
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY, "hex"), iv)
  let decrypted = decipher.update(encryptedText, "hex", "utf8")
  decrypted += decipher.final("utf8")
  return decrypted
}

export async function importHMACKey(keyBase64: string): Promise<crypto.KeyObject> {
  const keyBytes = Buffer.from(keyBase64, 'base64');
  return crypto.createSecretKey(keyBytes);
}

export async function signHMAC(payload: string, key: crypto.KeyObject): Promise<string> {
  return crypto.createHmac('sha256', key).update(payload).digest('base64');
}

export async function verifyHMAC(payload: string, signatureBase64: string, key: crypto.KeyObject): Promise<boolean> {
  const expectedSignature = await signHMAC(payload, key);
  return timingSafeEqual(expectedSignature, signatureBase64);
}

function timingSafeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}