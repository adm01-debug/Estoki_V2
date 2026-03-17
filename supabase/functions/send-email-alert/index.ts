import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html, tipo } = await req.json();
    const resendKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: 'ESTOKI WMS <onboarding@resend.dev>',
        to: Array.isArray(to) ? to : [to],
        subject: subject || `[ESTOKI] Alerta - ${tipo || 'Sistema'}`,
        html: html || `<h2>Alerta do ESTOKI WMS</h2><p>Tipo: ${tipo}</p>`,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Email error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
