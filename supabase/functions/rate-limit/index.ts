import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const rateLimits = new Map<string, { count: number; resetAt: number }>();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { key, limit = 100, window = 60 } = await req.json();
    const now = Date.now();
    const entry = rateLimits.get(key) || { count: 0, resetAt: now + window * 1000 };

    if (now > entry.resetAt) {
      entry.count = 0;
      entry.resetAt = now + window * 1000;
    }

    entry.count++;
    rateLimits.set(key, entry);

    const allowed = entry.count <= limit;
    return new Response(JSON.stringify({
      allowed,
      remaining: Math.max(0, limit - entry.count),
      resetAt: entry.resetAt,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
