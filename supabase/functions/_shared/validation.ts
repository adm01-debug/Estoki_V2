/**
 * Shared validation utilities for Edge Functions
 * Provides type-safe request parsing and error responses
 */

export function methodGuard(req: Request, allowed: string | string[]): Response | null {
  const methods = Array.isArray(allowed) ? allowed : [allowed];
  if (!methods.includes(req.method)) {
    return new Response(
      JSON.stringify({ error: `Method ${req.method} not allowed` }),
      { status: 405, headers: { 'Content-Type': 'application/json', 'Allow': methods.join(', ') } }
    );
  }
  return null;
}

export function errorResponse(message: string, status = 400, details?: unknown): Response {
  return new Response(
    JSON.stringify({ error: message, ...(details ? { details } : {}) }),
    { status, headers: { 'Content-Type': 'application/json' } }
  );
}

export function successResponse(data: unknown, headers: Record<string, string> = {}): Response {
  return new Response(
    JSON.stringify(data),
    { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } }
  );
}

export async function parseJsonBody<T>(req: Request): Promise<T | null> {
  try {
    return await req.json() as T;
  } catch {
    return null;
  }
}

/**
 * Rate limiting helper using in-memory store (per-instance)
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxRequests = 60, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}
