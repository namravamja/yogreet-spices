import { Request } from "express";

export function getCookieOptions(req: Request) {
  const isSecure =
    req.secure ||
    req.protocol === "https" ||
    req.get("x-forwarded-proto") === "https";

  // Cross-origin (Vercel → Render) requires sameSite:'none' + secure:true.
  // Local dev over HTTP uses sameSite:'lax' + secure:false.
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: (isSecure ? "none" : "lax") as "none" | "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

export function getClearCookieOptions(req: Request) {
  const isSecure =
    req.secure ||
    req.protocol === "https" ||
    req.get("x-forwarded-proto") === "https";

  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: (isSecure ? "none" : "lax") as "none" | "lax",
  };
}
