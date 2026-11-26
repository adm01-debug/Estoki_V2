/**
 * Shared CORS configuration for Edge Functions
 *
 * A lista vem de APP_ORIGINS (csv) quando existe; sem ela, usa os dominios conhecidos do
 * produto. Origin fora da lista NAO e refletido: devolve o primeiro item, para o navegador
 * bloquear sem que a resposta sirva de espelho para qualquer site.
 */

const ORIGENS_CONHECIDAS = [
  "https://estoki.app",
  "https://estoki-v2.vercel.app",
  "https://estoki-main.vercel.app",
  "https://estoki.lovable.app",
  "https://id-preview--0b6dd81f-1d9c-4b9d-85ea-f3b4f874dadd.lovable.app",
  "https://compra-vibe-connect.lovable.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

export function origensPermitidas(): string[] {
  const doAmbiente = (Deno.env.get("APP_ORIGINS") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return doAmbiente.length ? doAmbiente : ORIGENS_CONHECIDAS;
}

export function getCorsHeaders(request?: Request): Record<string, string> {
  const origin = request?.headers.get("Origin") ?? "";
  const permitidas = origensPermitidas();

  const allowedOrigin = permitidas.includes(origin) ? origin : permitidas[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

/** Convenience: handle OPTIONS preflight */
export function handleCors(request: Request): Response | null {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(request) });
  }
  return null;
}
