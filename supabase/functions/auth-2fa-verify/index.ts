import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { factorId, code, action } = await req.json();
    console.log('2FA Verify action:', action, 'for user:', user.id);

    if (!factorId || !code) {
      return new Response(JSON.stringify({ error: 'Factor ID and code are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'verify-enrollment') {
      // Create a challenge and verify it to complete enrollment
      const { data: challengeData, error: challengeError } = await supabaseClient.auth.mfa.challenge({
        factorId
      });

      if (challengeError) {
        console.error('MFA challenge error:', challengeError);
        return new Response(JSON.stringify({ error: challengeError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: verifyData, error: verifyError } = await supabaseClient.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code
      });

      if (verifyError) {
        console.error('MFA verify error:', verifyError);
        return new Response(JSON.stringify({ error: 'Código inválido. Verifique e tente novamente.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('MFA enrollment verified successfully');
      
      return new Response(JSON.stringify({
        success: true,
        message: '2FA ativado com sucesso!'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'verify-login') {
      // Verify TOTP code during login
      const { data: challengeData, error: challengeError } = await supabaseClient.auth.mfa.challenge({
        factorId
      });

      if (challengeError) {
        console.error('MFA challenge error:', challengeError);
        return new Response(JSON.stringify({ error: challengeError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: verifyData, error: verifyError } = await supabaseClient.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code
      });

      if (verifyError) {
        console.error('MFA verify error:', verifyError);
        return new Response(JSON.stringify({ error: 'Código inválido' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('MFA login verified successfully');
      
      return new Response(JSON.stringify({
        success: true,
        session: verifyData
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('2FA Verify error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
