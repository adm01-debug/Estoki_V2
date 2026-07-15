/**
 * Shared rate-limit middleware for Edge Functions.
 *
 * Per-instance in-memory sliding-window limiter. Since edge instances
 * are ephemeral and can be replicated, this is a soft limit — good
 * enough to blunt brute-force / burst abuse without a Redis dependency.
 * For per-user/per-tenant strong guarantees, upgrade to Deno KV or
 * pg-based token bucket in a follow-up.
 *
 * Usage:
 *   import { rateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
 *
 *   const rl = rateLimit(req, { key: "auth-login", max: 10, windowMs: 60_000 });
 *   if (!rl.ok) return rateLimitResponse(rl, req);
 */

import { getCorsHeaders } from "./cors.ts";

export interface RateLimitOptions {
  key: string;
  max: number;
  windowMs: number;
  /** Optional extra scope (e.g. userId) appended to the bucket key. */
  scope?: string;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSec: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

function clientIdentifier(req: Request): string {
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-real-ip") ??
    (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ??
    "anon"
  );
}

export function rateLimit(req: Request, opts: RateLimitOptions): RateLimitResult {
  const ip = clientIdentifier(req);
  const bucketKey = `${opts.key}:${ip}${opts.scope ? `:${opts.scope}` : ""}`;
  const now = Date.now();
  let bucket = store.get(bucketKey);

  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + opts.windowMs };
    store.set(bucketKey, bucket);
  }

  bucket.count++;
  const remaining = Math.max(0, opts.max - bucket.count);
  const retryAfterSec = Math.max(0, Math.ceil((bucket.resetAt - now) / 1000));

  return {
    ok: bucket.count <= opts.max,
    remaining,
    resetAt: bucket.resetAt,
    retryAfterSec,
  };
}

export function rateLimitResponse(result: RateLimitResult, req: Request): Response {
  return new Response(
    JSON.stringify({
      error: "rate_limited",
      message: "Too many requests. Try again later.",
      retry_after_seconds: result.retryAfterSec,
    }),
    {
      status: 429,
      headers: {
        ...getCorsHeaders(req),
        "Content-Type": "application/json",
        "Retry-After": String(result.retryAfterSec),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(result.resetAt),
      },
    },
  );
}

/**
 * Recommended presets for common surfaces. Tune per endpoint as needed.
 */
export const RateLimitPresets = {
  auth: { max: 10, windowMs: 60_000 },
  passwordReset: { max: 3, windowMs: 15 * 60_000 },
  payment: { max: 20, windowMs: 60_000 },
  pix: { max: 30, windowMs: 60_000 },
  boleto: { max: 20, windowMs: 60_000 },
  webhook: { max: 120, windowMs: 60_000 },
  read: { max: 300, windowMs: 60_000 },
  write: { max: 60, windowMs: 60_000 },
} as const;