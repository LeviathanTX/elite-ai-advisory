/**
 * Secure Storage Utility
 *
 * Provides basic obfuscation for sensitive data stored in localStorage.
 * Note: This is NOT encryption - localStorage is inherently insecure.
 * For production, sensitive data should be stored server-side only.
 *
 * This utility provides:
 * - Basic Base64 encoding to prevent casual inspection
 * - Automatic expiration for sensitive tokens
 * - Warnings when storing potentially sensitive data
 */

interface SecureStorageItem {
  value: string;
  timestamp: number;
  expiresAt?: number;
}

const STORAGE_PREFIX = 'secure_';
const DEFAULT_EXPIRY_MS = 3600000; // 1 hour

/**
 * Encode a string to Base64 (basic obfuscation, NOT encryption)
 */
function encode(str: string): string {
  try {
    return btoa(str);
  } catch (e) {
    console.error('Failed to encode data:', e);
    return str;
  }
}

/**
 * Decode a Base64 string
 */
function decode(str: string): string {
  try {
    return atob(str);
  } catch (e) {
    console.error('Failed to decode data:', e);
    return str;
  }
}

/**
 * Store a value with optional expiration
 * WARNING: localStorage is NOT secure storage. Use only for non-critical data.
 */
export function secureSetItem(key: string, value: string, expiryMs?: number): void {
  // Warn if storing sensitive-looking data
  if (
    value.toLowerCase().includes('password') ||
    value.toLowerCase().includes('secret') ||
    value.toLowerCase().includes('token') ||
    value.toLowerCase().includes('api_key') ||
    value.toLowerCase().includes('apikey')
  ) {
    console.warn(
      'WARNING: Attempting to store sensitive data in localStorage. This is insecure. Consider using httpOnly cookies or session storage.'
    );
  }

  const item: SecureStorageItem = {
    value: encode(value),
    timestamp: Date.now(),
    expiresAt: expiryMs ? Date.now() + expiryMs : undefined,
  };

  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(item));
  } catch (e) {
    console.error('Failed to store secure item:', e);
  }
}

/**
 * Retrieve a value from secure storage
 * Returns null if expired or not found
 */
export function secureGetItem(key: string): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_PREFIX + key);
    if (!stored) {
      return null;
    }

    const item: SecureStorageItem = JSON.parse(stored);

    // Check expiration
    if (item.expiresAt && Date.now() > item.expiresAt) {
      secureRemoveItem(key);
      return null;
    }

    return decode(item.value);
  } catch (e) {
    console.error('Failed to retrieve secure item:', e);
    return null;
  }
}

/**
 * Remove an item from secure storage
 */
export function secureRemoveItem(key: string): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (e) {
    console.error('Failed to remove secure item:', e);
  }
}

/**
 * Clear all secure storage items
 */
export function secureClearAll(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (e) {
    console.error('Failed to clear secure storage:', e);
  }
}

/**
 * Store API key with automatic expiration
 * NOTE: API keys should ideally be stored server-side only
 */
export function storeApiKey(serviceName: string, apiKey: string): void {
  console.warn(
    `Storing API key for ${serviceName} in browser storage. This is not recommended for production.`
  );
  secureSetItem(`api_key_${serviceName}`, apiKey, DEFAULT_EXPIRY_MS);
}

/**
 * Retrieve API key
 */
export function getApiKey(serviceName: string): string | null {
  return secureGetItem(`api_key_${serviceName}`);
}

/**
 * Remove API key
 */
export function removeApiKey(serviceName: string): void {
  secureRemoveItem(`api_key_${serviceName}`);
}

/**
 * Clear all stored API keys
 */
export function clearAllApiKeys(): void {
  const keysToRemove: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX + 'api_key_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (e) {
    console.error('Failed to clear API keys:', e);
  }
}

export default {
  setItem: secureSetItem,
  getItem: secureGetItem,
  removeItem: secureRemoveItem,
  clearAll: secureClearAll,
  storeApiKey,
  getApiKey,
  removeApiKey,
  clearAllApiKeys,
};
