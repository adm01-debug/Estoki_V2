import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { report, params = {} } = await req.json();

    let result;

    switch (report) {
      case "inventory_summary":
        result = await inventorySummary(supabase, params);
        break;
      case "stock_movement_history":
        result = await stockMovementHistory(supabase, params);
        break;
      case "low_stock_report":
        result = await lowStockReport(supabase, params);
        break;
      case "receiving_performance":
        result = await receivingPerformance(supabase, params);
        break;
      case "shipping_performance":
        result = await shippingPerformance(supabase, params);
        break;
      case "location_utilization":
        result = await locationUtilization(supabase, params);
        break;
      case "product_abc_analysis":
        result = await productABCAnalysis(supabase, params);
        break;
      case "expiry_report":
        result = await expiryReport(supabase, params);
        break;
      case "inventory_valuation":
        result = await inventoryValuation(supabase, params);
        break;
      case "kpi_dashboard":
        result = await kpiDashboard(supabase, params);
        break;
      default:
        throw new Error(`Relatório não encontrado: ${report}`);
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[reports] Error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Resumo de inventário
async function inventorySummary(supabase: any, params: any) {
  const { data } = await supabase.rpc("get_inventory_summary", params);
  
  // Fallback query
  if (!data) {
    const { data: balances } = await supabase
      .from("stock_balances")
      .select(`
        quantity,
        reserved_quantity,
        available_quantity,
        product:products(id, name, sku, cost_price, sell_price, category:categories(name)),
        location:locations(id, name, zone)
      `);

    const summary = {
      total_products: new Set(balances?.map((b: any) => b.product?.id)).size,
      total_quantity: balances?.reduce((sum: number, b: any) => sum + b.quantity, 0) || 0,
      total_value: balances?.reduce((sum: number, b: any) => 
        sum + (b.quantity * (b.product?.cost_price || 0)), 0) || 0,
      by_category: {},
      by_zone: {},
    };

    return summary;
  }

  return data;
}

// Histórico de movimentações
async function stockMovementHistory(supabase: any, params: any) {
  const { start_date, end_date, product_id, type, limit = 1000 } = params;

  let query = supabase
    .from("stock_movements")
    .select(`
      *,
      product:products(name, sku),
      from_location:locations!from_location_id(name, code),
      to_location:locations!to_location_id(name, code)
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (start_date) query = query.gte("created_at", start_date);
  if (end_date) query = query.lte("created_at", end_date);
  if (product_id) query = query.eq("product_id", product_id);
  if (type) query = query.eq("type", type);

  const { data } = await query;

  // Agregar por tipo
  const byType = data?.reduce((acc: any, m: any) => {
    acc[m.type] = (acc[m.type] || 0) + 1;
    return acc;
  }, {});

  return { movements: data, summary: { total: data?.length, by_type: byType } };
}

// Produtos com estoque baixo
async function lowStockReport(supabase: any, params: any) {
  const { threshold_percentage = 100 } = params;

  const { data } = await supabase
    .from("products")
    .select(`
      id, name, sku, min_stock, max_stock,
      stock_balances(quantity, location:locations(name))
    `)
    .gt("min_stock", 0);

  const lowStockProducts = data?.filter((p: any) => {
    const totalStock = p.stock_balances?.reduce((sum: number, b: any) => sum + b.quantity, 0) || 0;
    const threshold = (p.min_stock * threshold_percentage) / 100;
    return totalStock <= threshold;
  }).map((p: any) => ({
    ...p,
    current_stock: p.stock_balances?.reduce((sum: number, b: any) => sum + b.quantity, 0) || 0,
    shortage: p.min_stock - (p.stock_balances?.reduce((sum: number, b: any) => sum + b.quantity, 0) || 0),
  }));

  return {
    products: lowStockProducts,
    total: lowStockProducts?.length || 0,
    critical: lowStockProducts?.filter((p: any) => p.current_stock === 0).length || 0,
  };
}

// Performance de recebimento
async function receivingPerformance(supabase: any, params: any) {
  const { start_date, end_date } = params;

  let query = supabase
    .from("receiving_documents")
    .select(`
      id, document_number, status, created_at, completed_at,
      receiving_items(expected_quantity, received_quantity)
    `);

  if (start_date) query = query.gte("created_at", start_date);
  if (end_date) query = query.lte("created_at", end_date);

  const { data } = await query;

  const metrics = {
    total_documents: data?.length || 0,
    completed: data?.filter((d: any) => d.status === 'completed').length || 0,
    pending: data?.filter((d: any) => d.status === 'pending').length || 0,
    avg_processing_time_hours: 0,
    accuracy_rate: 0,
  };

  // Calcular tempo médio
  const completedDocs = data?.filter((d: any) => d.completed_at);
  if (completedDocs?.length) {
    const totalHours = completedDocs.reduce((sum: number, d: any) => {
      const created = new Date(d.created_at).getTime();
      const completed = new Date(d.completed_at).getTime();
      return sum + (completed - created) / (1000 * 60 * 60);
    }, 0);
    metrics.avg_processing_time_hours = totalHours / completedDocs.length;
  }

  return metrics;
}

// Performance de expedição
async function shippingPerformance(supabase: any, params: any) {
  const { start_date, end_date } = params;

  let query = supabase
    .from("shipments")
    .select(`
      id, status, created_at, shipped_at, delivered_at,
      carrier:carriers(name)
    `);

  if (start_date) query = query.gte("created_at", start_date);
  if (end_date) query = query.lte("created_at", end_date);

  const { data } = await query;

  return {
    total_shipments: data?.length || 0,
    shipped: data?.filter((s: any) => s.status === 'shipped').length || 0,
    delivered: data?.filter((s: any) => s.status === 'delivered').length || 0,
    by_carrier: data?.reduce((acc: any, s: any) => {
      const carrier = s.carrier?.name || 'Outros';
      acc[carrier] = (acc[carrier] || 0) + 1;
      return acc;
    }, {}),
  };
}

// Utilização de localizações
async function locationUtilization(supabase: any, params: any) {
  const { data: locations } = await supabase
    .from("locations")
    .select(`
      id, code, name, zone, capacity, type,
      stock_balances(quantity)
    `)
    .eq("is_active", true);

  return locations?.map((loc: any) => {
    const usedCapacity = loc.stock_balances?.reduce((sum: number, b: any) => sum + b.quantity, 0) || 0;
    const utilization = loc.capacity ? (usedCapacity / loc.capacity) * 100 : 0;

    return {
      id: loc.id,
      code: loc.code,
      name: loc.name,
      zone: loc.zone,
      type: loc.type,
      capacity: loc.capacity,
      used: usedCapacity,
      available: (loc.capacity || 0) - usedCapacity,
      utilization_percent: Math.round(utilization * 100) / 100,
    };
  });
}

// Análise ABC de produtos
async function productABCAnalysis(supabase: any, params: any) {
  const { data } = await supabase
    .from("stock_movements")
    .select(`
      product_id,
      quantity,
      product:products(id, name, sku, sell_price)
    `)
    .eq("type", "out");

  // Calcular valor vendido por produto
  const productValues: Record<string, { id: string; name: string; sku: string; value: number }> = {};
  
  data?.forEach((m: any) => {
    if (!m.product) return;
    const key = m.product_id;
    if (!productValues[key]) {
      productValues[key] = {
        id: m.product.id,
        name: m.product.name,
        sku: m.product.sku,
        value: 0,
      };
    }
    productValues[key].value += m.quantity * (m.product.sell_price || 0);
  });

  // Ordenar por valor
  const sorted = Object.values(productValues).sort((a, b) => b.value - a.value);
  const totalValue = sorted.reduce((sum, p) => sum + p.value, 0);

  // Classificar ABC
  let cumulative = 0;
  const classified = sorted.map(p => {
    cumulative += p.value;
    const percentage = (cumulative / totalValue) * 100;
    let classification = 'C';
    if (percentage <= 80) classification = 'A';
    else if (percentage <= 95) classification = 'B';
    
    return { ...p, classification, percentage_of_total: (p.value / totalValue) * 100 };
  });

  return {
    products: classified,
    summary: {
      A: classified.filter(p => p.classification === 'A').length,
      B: classified.filter(p => p.classification === 'B').length,
      C: classified.filter(p => p.classification === 'C').length,
    },
  };
}

// Relatório de validade
async function expiryReport(supabase: any, params: any) {
  const { days_ahead = 30 } = params;
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days_ahead);

  const { data } = await supabase
    .from("lot_tracking")
    .select(`
      id, lot_number, expiry_date, quantity,
      product:products(name, sku),
      location:locations(name, code)
    `)
    .lte("expiry_date", futureDate.toISOString())
    .gt("quantity", 0)
    .order("expiry_date");

  const now = new Date();
  const categorized = {
    expired: data?.filter((l: any) => new Date(l.expiry_date) < now) || [],
    expiring_soon: data?.filter((l: any) => {
      const exp = new Date(l.expiry_date);
      return exp >= now && exp <= futureDate;
    }) || [],
  };

  return {
    ...categorized,
    total_expired: categorized.expired.length,
    total_expiring: categorized.expiring_soon.length,
  };
}

// Valorização de inventário
async function inventoryValuation(supabase: any, params: any) {
  const { data } = await supabase
    .from("stock_balances")
    .select(`
      quantity,
      product:products(id, name, sku, cost_price, sell_price, category:categories(name))
    `)
    .gt("quantity", 0);

  const valuation = data?.reduce((acc: any, b: any) => {
    const costValue = b.quantity * (b.product?.cost_price || 0);
    const sellValue = b.quantity * (b.product?.sell_price || 0);
    
    acc.total_cost += costValue;
    acc.total_sell += sellValue;
    acc.total_items += b.quantity;
    
    const category = b.product?.category?.name || 'Sem Categoria';
    if (!acc.by_category[category]) {
      acc.by_category[category] = { cost: 0, sell: 0, items: 0 };
    }
    acc.by_category[category].cost += costValue;
    acc.by_category[category].sell += sellValue;
    acc.by_category[category].items += b.quantity;
    
    return acc;
  }, { total_cost: 0, total_sell: 0, total_items: 0, by_category: {} });

  return {
    ...valuation,
    potential_profit: valuation.total_sell - valuation.total_cost,
    margin_percent: valuation.total_cost > 0 
      ? ((valuation.total_sell - valuation.total_cost) / valuation.total_cost) * 100 
      : 0,
  };
}

// Dashboard KPIs
async function kpiDashboard(supabase: any, params: any) {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

  // Buscar dados em paralelo
  const [receivingToday, shippingToday, lowStock, movements] = await Promise.all([
    supabase.from("receiving_documents").select("id", { count: "exact" }).gte("created_at", startOfDay),
    supabase.from("shipments").select("id", { count: "exact" }).gte("created_at", startOfDay),
    supabase.from("products").select("id", { count: "exact" }).gt("min_stock", 0),
    supabase.from("stock_movements").select("id, type").gte("created_at", startOfMonth),
  ]);

  return {
    receiving_today: receivingToday.count || 0,
    shipping_today: shippingToday.count || 0,
    low_stock_products: lowStock.count || 0,
    movements_this_month: movements.data?.length || 0,
    movement_breakdown: movements.data?.reduce((acc: any, m: any) => {
      acc[m.type] = (acc[m.type] || 0) + 1;
      return acc;
    }, {}),
  };
}
