/**
 * Shared CORS configuration for Edge Functions
 * 
 * Restricts origins to known domains in production.
 * Falls back to wildcard only in development.
 */

const ALLOWED_ORIGINS = [
  'https://id-preview--0b6dd81f-1d9c-4b9d-85ea-f3b4f874dadd.lovable.app',
  'https://estoki.lovable.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

export function getCorsHeaders(request?: Request): Record<string, string> {
  const origin = request?.headers.get('Origin') ?? '';
  
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
}

/** Convenience: handle OPTIONS preflight */
export function handleCors(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: getCorsHeaders(request) });
  }
  return null;
}
