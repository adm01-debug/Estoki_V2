import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { api, endpoint, method = 'GET', payload } = await req.json();

    // Buscar configuração da API
    const { data: config } = await supabase
      .from('configuracoes')
      .select('*')
      .eq('chave', `api_${api}`)
      .single();

    if (!config) {
      return new Response(JSON.stringify({ error: 'API não configurada' }), {
        status: 400,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    // Fazer chamada à API externa
    const response = await fetch(`${config.valor}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: payload ? JSON.stringify(payload) : undefined,
    });

    const data = await response.json();

    // Log da sincronização
    await supabase.from('alertas_historico').insert({
      tipo: 'sync',
      mensagem: `Sync com ${api}: ${endpoint}`,
      dados: { status: response.status, registros: Array.isArray(data) ? data.length : 1 },
    });

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }
});
