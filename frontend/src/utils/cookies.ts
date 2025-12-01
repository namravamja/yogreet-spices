/**
 * Production-ready cookie utility
 * Handles cookies securely with proper settings for production use
 */

export interface CookieOptions {
  expires?: Date | number; // Date object or days from now
  path?: string;
  domain?: string;
  secure?: boolean; // HTTPS only
  sameSite?: 'strict' | 'lax' | 'none';
  httpOnly?: boolean; // Note: httpOnly can only be set server-side
}

/**
 * Check if the current connection is secure (HTTPS)
 * Only returns true for actual HTTPS connections, not IP addresses or localhost
 */
const isSecureConnection = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  // Only return true for actual HTTPS protocol
  // IP addresses and localhost on HTTP should return false
  return window.location.protocol === 'https:';
};

const DEFAULT_OPTIONS: CookieOptions = {
  path: '/',
  secure: isSecureConnection(), // Only secure if actually on HTTPS
  sameSite: 'lax', // CSRF protection - use 'lax' for non-secure connections
};

/**
 * Set a cookie with the given name, value, and options
 */
export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  if (typeof window === 'undefined') {
    // Server-side: cookies should be set via HTTP headers
    console.warn('setCookie called server-side. Use HTTP headers instead.');
    return;
  }

  // Determine secure flag based on actual connection
  const isSecure = options.secure !== undefined ? options.secure : isSecureConnection();
  
  // For non-secure connections, use 'lax' instead of 'none' (none requires secure)
  const sameSiteValue = options.sameSite || (isSecure ? 'lax' : 'lax');
  
  const opts = { 
    ...DEFAULT_OPTIONS, 
    ...options,
    secure: isSecure,
    sameSite: sameSiteValue
  };
  
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  // Handle expiration
  if (opts.expires) {
    let expiresDate: Date;
    if (typeof opts.expires === 'number') {
      expiresDate = new Date();
      expiresDate.setTime(expiresDate.getTime() + opts.expires * 24 * 60 * 60 * 1000);
    } else {
      expiresDate = opts.expires;
    }
    cookieString += `; expires=${expiresDate.toUTCString()}`;
  }

  // Add path
  if (opts.path) {
    cookieString += `; path=${opts.path}`;
  }

  // Add domain
  if (opts.domain) {
    cookieString += `; domain=${opts.domain}`;
  }

  // Add secure flag (only if actually secure)
  if (opts.secure) {
    cookieString += `; secure`;
  }

  // Add sameSite
  if (opts.sameSite) {
    cookieString += `; samesite=${opts.sameSite}`;
  }

  // Note: httpOnly cannot be set from JavaScript for security reasons
  // It must be set via HTTP headers on the server

  document.cookie = cookieString;
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const nameEQ = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
    }
  }

  return null;
}

/**
 * Remove a cookie by setting it to expire in the past
 */
export function removeCookie(name: string, options: CookieOptions = {}): void {
  if (typeof window === 'undefined') {
    return;
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };
  setCookie(name, '', {
    ...opts,
    expires: new Date(0), // Set to epoch time (past)
  });
}

/**
 * Check if a cookie exists
 */
export function hasCookie(name: string): boolean {
  return getCookie(name) !== null;
}

/**
 * Get all cookies as an object
 */
export function getAllCookies(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {};
  }

  const cookies: Record<string, string> = {};
  const cookieArray = document.cookie.split(';');

  for (let i = 0; i < cookieArray.length; i++) {
    const cookie = cookieArray[i].trim();
    if (cookie) {
      const [name, value] = cookie.split('=');
      if (name && value) {
        cookies[decodeURIComponent(name)] = decodeURIComponent(value);
      }
    }
  }

  return cookies;
}

/**
 * Clear all cookies (removes all cookies for the current domain)
 */
export function clearAllCookies(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const cookies = getAllCookies();
  Object.keys(cookies).forEach((name) => {
    removeCookie(name);
  });
}

