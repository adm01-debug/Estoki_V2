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

    const { tipo, filtros, titulo } = await req.json();

    let dados: any[] = [];
    switch (tipo) {
      case 'estoque':
        const { data: estoque } = await supabase.from('posicoes_estoque').select('*');
        dados = estoque || [];
        break;
      case 'triagem':
        const { data: triagem } = await supabase.from('eventos_triagem').select('*');
        dados = triagem || [];
        break;
      case 'recebimento':
        const { data: recebimento } = await supabase.from('recebimentos').select('*');
        dados = recebimento || [];
        break;
    }

    // Aqui integraria com biblioteca de PDF (jsPDF, PDFKit, etc)
    const pdfBase64 = btoa(JSON.stringify({ titulo, tipo, registros: dados.length, dados }));

    return new Response(JSON.stringify({
      success: true,
      pdf: pdfBase64,
      metadata: { tipo, registros: dados.length, geradoEm: new Date().toISOString() }
    }), {
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }
});
