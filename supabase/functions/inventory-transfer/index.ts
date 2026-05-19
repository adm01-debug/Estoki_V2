import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { getCorsHeaders } from "../_shared/cors.ts";
import { InventoryTransferSchema, validateInput } from "../_shared/schemas.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });
  const headers = { ...getCorsHeaders(req), 'Content-Type': 'application/json' };

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const validation = validateInput(InventoryTransferSchema, body);
    
    if (!validation.success) {
      return new Response(JSON.stringify({ error: validation.error, details: validation.details }), { status: 400, headers });
    }

    const { produto_id, origem_id, destino_id, quantidade, lote_id } = validation.data;

    // 1. Check origin stock
    const { data: originStock, error: originError } = await supabaseClient
      .from('estoque_posicao')
      .select('quantidade')
      .eq('produto_id', produto_id)
      .eq('posicao_id', origem_id)
      .maybeSingle();

    if (originError) throw originError;
    if (!originStock || originStock.quantidade < quantidade) {
      return new Response(JSON.stringify({ error: "Saldo insuficiente na origem" }), { status: 400, headers });
    }

    // 2. Perform transfer (simplified transaction simulation)
    // In production, use a Database Function (RPC) for atomicity
    const { error: decreaseError } = await supabaseClient
      .from('estoque_posicao')
      .update({ quantidade: originStock.quantidade - quantidade })
      .eq('produto_id', produto_id)
      .eq('posicao_id', origem_id);

    if (decreaseError) throw decreaseError;

    const { data: destStock } = await supabaseClient
      .from('estoque_posicao')
      .select('quantidade')
      .eq('produto_id', produto_id)
      .eq('posicao_id', destino_id)
      .maybeSingle();

    const { error: increaseError } = await supabaseClient
      .from('estoque_posicao')
      .upsert({ 
        produto_id, 
        posicao_id: destino_id, 
        quantidade: (destStock?.quantidade || 0) + quantidade,
        lote_id
      });

    if (increaseError) throw increaseError;

    // 3. Log movement
    await supabaseClient.from('movimentacoes_estoque').insert({
      produto_id,
      posicao_origem_id: origem_id,
      posicao_destino_id: destino_id,
      quantidade,
      tipo: 'transferencia',
      lote_id,
      created_at: new Date().toISOString()
    }).catch(console.error);

    return new Response(JSON.stringify({
      success: true,
      message: "Transferência realizada com sucesso",
      data: { produto_id, quantidade, origem_id, destino_id }
    }), { headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
});
