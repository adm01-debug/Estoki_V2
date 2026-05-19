import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { getCorsHeaders } from "../_shared/cors.ts";
import { InventoryReserveSchema, validateInput } from "../_shared/schemas.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });
  const headers = { ...getCorsHeaders(req), 'Content-Type': 'application/json' };

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const validation = validateInput(InventoryReserveSchema, body);
    
    if (!validation.success) {
      return new Response(JSON.stringify({ error: validation.error, details: validation.details }), { status: 400, headers });
    }

    const { produto_id, quantidade, pedido_id, prioridade } = validation.data;

    // Log the reservation attempt
    await supabaseClient.from('inventory_reservations').insert({
      product_id: produto_id,
      quantity: quantidade,
      order_id: pedido_id,
      priority: prioridade,
      status: 'pending',
      created_at: new Date().toISOString()
    }).catch(console.error);

    return new Response(JSON.stringify({
      success: true,
      message: "Reserva solicitada com sucesso",
      data: validation.data
    }), { headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
});
