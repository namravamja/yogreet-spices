import { Request } from "express";

/**
 * Get cookie options based on the request protocol
 * Supports both secure (HTTPS) and non-secure (HTTP/IP) connections
 */
export function getCookieOptions(req: Request) {
  // Check if request is secure (HTTPS) or forwarded as secure
  const isSecure = 
    req.secure || 
    req.protocol === 'https' || 
    req.get('x-forwarded-proto') === 'https';

  // For secure connections, use secure flag
  // For non-secure connections (IP addresses, localhost), don't use secure flag
  // Use 'lax' sameSite for both (works with and without secure flag)
  // Note: sameSite 'none' requires secure: true, so we use 'lax' which works for both
  return {
    httpOnly: true,
    secure: isSecure, // Only secure if actually on HTTPS
    sameSite: 'lax' as const, // Works for both secure and non-secure connections
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
}

/**
 * Get cookie options for clearing cookies
 */
export function getClearCookieOptions(req: Request) {
  const isSecure = 
    req.secure || 
    req.protocol === 'https' || 
    req.get('x-forwarded-proto') === 'https';

  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax' as const, // Works for both secure and non-secure connections
  };
}
