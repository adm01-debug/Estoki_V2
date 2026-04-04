import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

const cache = new Map<string, { value: any; expiresAt: number }>();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    const { action, key, value, ttl = 300 } = await req.json();
    const now = Date.now();

    if (action === 'get') {
      const entry = cache.get(key);
      if (entry && entry.expiresAt > now) {
        return new Response(JSON.stringify({ hit: true, value: entry.value }), {
          headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ hit: false }), {
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    if (action === 'set') {
      cache.set(key, { value, expiresAt: now + ttl * 1000 });
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    if (action === 'delete') {
      cache.delete(key);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }
});
