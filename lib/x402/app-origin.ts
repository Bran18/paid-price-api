import type { NextRequest } from "next/server";

/**
 * Origin used when the server calls its own paid route (demo-pay, scripts).
 * Prefer the incoming request origin on Vercel; ignore localhost in NEXT_PUBLIC_APP_URL.
 */
export function resolveAppOrigin(request?: NextRequest): string {
  const fromRequest = request?.nextUrl.origin;
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");

  if (configured && !isLocalOrigin(configured)) {
    return configured;
  }

  if (fromRequest && !isLocalOrigin(fromRequest)) {
    return fromRequest;
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel.replace(/^https?:\/\//, "")}`;
  }

  if (configured) return configured;
  if (fromRequest) return fromRequest;

  return "http://localhost:3000";
}

function isLocalOrigin(origin: string): boolean {
  try {
    const host = new URL(origin).hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return false;
  }
}
