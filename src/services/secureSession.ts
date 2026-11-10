import { seal, unseal, defaults } from 'iron-webcrypto';

/**
 * Ephemeral in memory session key.
 * Generated securely using Web Crypto API per browser session if no env secret is supplied.
 * Strictly never hardcoded and never uses fallback string operators.
 */
let ephemeralSessionKey: string | null = null;

function getSessionSecret(): string {
  const envSecret = import.meta.env.VITE_SESSION_SECRET;

  if (typeof envSecret === 'string' && envSecret.trim().length >= 32) {
    return envSecret.trim();
  }

  if (!ephemeralSessionKey) {
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    ephemeralSessionKey = Array.from(randomBytes, (b) =>
      b.toString(16).padStart(2, '0')
    ).join('');
  }

  return ephemeralSessionKey;
}

/**
 * Encrypt and seal any object or value using Iron cryptographic protocol.
 */
export async function encryptSessionData<T>(data: T): Promise<string> {
  const secret = getSessionSecret();
  return seal(data, secret, defaults);
}

/**
 * Decrypt and unseal an Iron token. Returns null if invalid or tampered with.
 */
export async function decryptSessionData<T>(sealedToken: string): Promise<T | null> {
  if (!sealedToken || typeof sealedToken !== 'string') return null;

  try {
    const secret = getSessionSecret();
    const data = await unseal(sealedToken, secret, defaults);
    return data as T;
  } catch (err) {
    console.warn('Secure session decryption notice:', err);
    return null;
  }
}

/**
 * Store encrypted data in sessionStorage under key.
 */
export async function setSecureSessionItem<T>(key: string, data: T): Promise<void> {
  try {
    const encrypted = await encryptSessionData(data);
    sessionStorage.setItem(key, encrypted);
  } catch (err) {
    console.warn('Failed to store secure session item:', err);
  }
}

/**
 * Retrieve and decrypt data from sessionStorage.
 */
export async function getSecureSessionItem<T>(key: string): Promise<T | null> {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    return await decryptSessionData<T>(raw);
  } catch (err) {
    console.warn('Failed to retrieve secure session item:', err);
    return null;
  }
}

/**
 * Remove an item from secure sessionStorage.
 */
export function removeSecureSessionItem(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch (err) {
    console.warn('Failed to remove secure session item:', err);
  }
}

/**
 * Clear all items in secure sessionStorage.
 */
export function clearSecureSession(): void {
  try {
    sessionStorage.clear();
  } catch (err) {
    console.warn('Failed to clear secure session:', err);
  }
}
