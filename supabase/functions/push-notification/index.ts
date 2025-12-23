import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { subscription, title, body, icon, data } = await req.json();

    // Web Push notification payload
    const payload = JSON.stringify({
      title,
      body,
      icon: icon || '/icon-192.png',
      data,
    });

    // Note: In production, you'd use web-push library
    console.log('Push notification:', payload);

    return new Response(JSON.stringify({ success: true, message: 'Notification queued' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
