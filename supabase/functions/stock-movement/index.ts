import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

interface StockMovement {
  product_id: string;
  from_location_id?: string;
  to_location_id?: string;
  quantity: number;
  type: 'in' | 'out' | 'transfer' | 'adjustment';
  reference_type?: string;
  reference_id?: string;
  lot_id?: string;
  notes?: string;
  user_id: string;
}

interface StockBalance {
  product_id: string;
  location_id: string;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { action, data } = await req.json();

    switch (action) {
      case "create_movement": {
        const movement = data as StockMovement;
        
        // Validar movimento
        if (!movement.product_id || !movement.quantity || !movement.type) {
          throw new Error("Campos obrigatórios: product_id, quantity, type");
        }

        if (movement.quantity <= 0) {
          throw new Error("Quantidade deve ser maior que zero");
        }

        // Iniciar transação
        const movementRecord = {
          ...movement,
          created_at: new Date().toISOString(),
        };

        // Inserir movimento
        const { data: insertedMovement, error: moveError } = await supabase
          .from("stock_movements")
          .insert(movementRecord)
          .select()
          .single();

        if (moveError) throw moveError;

        // Atualizar saldos baseado no tipo
        if (movement.type === 'in' && movement.to_location_id) {
          // Entrada: adicionar ao destino
          await updateStockBalance(supabase, movement.product_id, movement.to_location_id, movement.quantity);
        } else if (movement.type === 'out' && movement.from_location_id) {
          // Saída: remover da origem
          await updateStockBalance(supabase, movement.product_id, movement.from_location_id, -movement.quantity);
        } else if (movement.type === 'transfer' && movement.from_location_id && movement.to_location_id) {
          // Transferência: remover da origem e adicionar ao destino
          await updateStockBalance(supabase, movement.product_id, movement.from_location_id, -movement.quantity);
          await updateStockBalance(supabase, movement.product_id, movement.to_location_id, movement.quantity);
        } else if (movement.type === 'adjustment' && movement.to_location_id) {
          // Ajuste: pode ser positivo ou negativo
          await updateStockBalance(supabase, movement.product_id, movement.to_location_id, movement.quantity);
        }

        // Verificar alertas de estoque baixo
        await checkLowStockAlert(supabase, movement.product_id);

        return new Response(JSON.stringify({ 
          success: true, 
          movement: insertedMovement 
        }), {
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }

      case "get_balance": {
        const { product_id, location_id } = data;

        let query = supabase
          .from("stock_balances")
          .select("*");

        if (product_id) query = query.eq("product_id", product_id);
        if (location_id) query = query.eq("location_id", location_id);

        const { data: balances, error } = await query;
        if (error) throw error;

        return new Response(JSON.stringify({ 
          success: true, 
          balances 
        }), {
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }

      case "get_movements": {
        const { product_id, location_id, type, start_date, end_date, limit = 50 } = data;

        let query = supabase
          .from("stock_movements")
          .select("*, product:products(*), from_location:locations!from_location_id(*), to_location:locations!to_location_id(*)")
          .order("created_at", { ascending: false })
          .limit(limit);

        if (product_id) query = query.eq("product_id", product_id);
        if (type) query = query.eq("type", type);
        if (start_date) query = query.gte("created_at", start_date);
        if (end_date) query = query.lte("created_at", end_date);
        if (location_id) {
          query = query.or(`from_location_id.eq.${location_id},to_location_id.eq.${location_id}`);
        }

        const { data: movements, error } = await query;
        if (error) throw error;

        return new Response(JSON.stringify({ 
          success: true, 
          movements 
        }), {
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }

      case "reserve_stock": {
        const { product_id, location_id, quantity, order_id } = data;

        // Verificar disponibilidade
        const { data: balance, error: balanceError } = await supabase
          .from("stock_balances")
          .select("*")
          .eq("product_id", product_id)
          .eq("location_id", location_id)
          .single();

        if (balanceError) throw balanceError;
        if (!balance || balance.available_quantity < quantity) {
          throw new Error(`Estoque insuficiente. Disponível: ${balance?.available_quantity || 0}`);
        }

        // Criar reserva
        const { error: reserveError } = await supabase
          .from("stock_reservations")
          .insert({
            product_id,
            location_id,
            quantity,
            order_id,
            status: 'active',
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
          });

        if (reserveError) throw reserveError;

        // Atualizar saldo reservado
        const { error: updateError } = await supabase
          .from("stock_balances")
          .update({
            reserved_quantity: balance.reserved_quantity + quantity,
            available_quantity: balance.available_quantity - quantity,
          })
          .eq("product_id", product_id)
          .eq("location_id", location_id);

        if (updateError) throw updateError;

        return new Response(JSON.stringify({ 
          success: true, 
          message: "Estoque reservado com sucesso" 
        }), {
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }

      default:
        throw new Error(`Ação desconhecida: ${action}`);
    }
  } catch (error) {
    console.error("[stock-movement] Error:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 400,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});

// Helper: Atualizar saldo de estoque
async function updateStockBalance(
  supabase: any,
  productId: string,
  locationId: string,
  quantityChange: number
) {
  // Buscar saldo atual
  const { data: existing } = await supabase
    .from("stock_balances")
    .select("*")
    .eq("product_id", productId)
    .eq("location_id", locationId)
    .single();

  if (existing) {
    const newQuantity = existing.quantity + quantityChange;
    if (newQuantity < 0) {
      throw new Error(`Saldo insuficiente. Disponível: ${existing.quantity}`);
    }

    await supabase
      .from("stock_balances")
      .update({
        quantity: newQuantity,
        available_quantity: newQuantity - existing.reserved_quantity,
        updated_at: new Date().toISOString(),
      })
      .eq("product_id", productId)
      .eq("location_id", locationId);
  } else if (quantityChange > 0) {
    // Criar novo registro de saldo
    await supabase
      .from("stock_balances")
      .insert({
        product_id: productId,
        location_id: locationId,
        quantity: quantityChange,
        reserved_quantity: 0,
        available_quantity: quantityChange,
      });
  } else {
    throw new Error("Não é possível criar saldo negativo");
  }
}

// Helper: Verificar alerta de estoque baixo
async function checkLowStockAlert(supabase: any, productId: string) {
  const { data: product } = await supabase
    .from("products")
    .select("id, name, sku, min_stock")
    .eq("id", productId)
    .single();

  if (!product || !product.min_stock) return;

  const { data: balances } = await supabase
    .from("stock_balances")
    .select("quantity")
    .eq("product_id", productId);

  const totalStock = balances?.reduce((sum: number, b: any) => sum + b.quantity, 0) || 0;

  if (totalStock <= product.min_stock) {
    // Criar notificação de alerta
    await supabase.from("notifications").insert({
      type: "warning",
      title: "Estoque Baixo",
      message: `${product.name} (${product.sku}) está com estoque baixo: ${totalStock} unidades`,
      priority: totalStock === 0 ? "urgent" : "high",
      metadata: { product_id: productId, current_stock: totalStock, min_stock: product.min_stock },
    });
  }
}
