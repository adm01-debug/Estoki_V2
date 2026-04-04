import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

interface ImportResult {
  total: number;
  success: number;
  errors: number;
  errorDetails: Array<{ row: number; error: string }>;
}

interface ProductImport {
  sku: string;
  name: string;
  description?: string;
  category_code?: string;
  unit_code?: string;
  barcode?: string;
  weight?: number;
  width?: number;
  height?: number;
  depth?: number;
  min_stock?: number;
  max_stock?: number;
  cost_price?: number;
  sell_price?: number;
}

interface ReceivingImport {
  document_number: string;
  supplier_code: string;
  items: Array<{
    sku: string;
    quantity: number;
    lot_number?: string;
    expiry_date?: string;
    location_code?: string;
  }>;
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
    const { type, data, options = {} } = await req.json();
    const { skip_errors = true, update_existing = true, batch_size = 100 } = options;

    let result: ImportResult;

    switch (type) {
      case "products":
        result = await importProducts(supabase, data, { skip_errors, update_existing, batch_size });
        break;
      case "receiving":
        result = await importReceiving(supabase, data, { skip_errors });
        break;
      case "locations":
        result = await importLocations(supabase, data, { skip_errors, update_existing });
        break;
      case "stock_adjustment":
        result = await importStockAdjustment(supabase, data, { skip_errors });
        break;
      default:
        throw new Error(`Tipo de importação não suportado: ${type}`);
    }

    // Log da importação
    await supabase.from("import_logs").insert({
      type,
      total_records: result.total,
      success_count: result.success,
      error_count: result.errors,
      error_details: result.errorDetails,
      options,
    });

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[batch-import] Error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 400,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});

// Importar produtos
async function importProducts(
  supabase: any,
  products: ProductImport[],
  options: { skip_errors: boolean; update_existing: boolean; batch_size: number }
): Promise<ImportResult> {
  const result: ImportResult = { total: products.length, success: 0, errors: 0, errorDetails: [] };

  // Buscar categorias e unidades para lookup
  const { data: categories } = await supabase.from("categories").select("id, code");
  const { data: units } = await supabase.from("units_of_measure").select("id, code");

  const categoryMap = new Map(categories?.map((c: any) => [c.code, c.id]) || []);
  const unitMap = new Map(units?.map((u: any) => [u.code, u.id]) || []);

  // Processar em batches
  for (let i = 0; i < products.length; i += options.batch_size) {
    const batch = products.slice(i, i + options.batch_size);

    for (let j = 0; j < batch.length; j++) {
      const rowIndex = i + j + 1;
      const product = batch[j];

      try {
        // Validações
        if (!product.sku || !product.name) {
          throw new Error("SKU e Nome são obrigatórios");
        }

        // Resolver relacionamentos
        const productData: any = {
          sku: product.sku.trim(),
          name: product.name.trim(),
          description: product.description,
          barcode: product.barcode,
          weight: product.weight,
          width: product.width,
          height: product.height,
          depth: product.depth,
          min_stock: product.min_stock || 0,
          max_stock: product.max_stock,
          cost_price: product.cost_price,
          sell_price: product.sell_price,
          is_active: true,
        };

        if (product.category_code && categoryMap.has(product.category_code)) {
          productData.category_id = categoryMap.get(product.category_code);
        }

        if (product.unit_code && unitMap.has(product.unit_code)) {
          productData.unit_id = unitMap.get(product.unit_code);
        }

        // Verificar se existe
        const { data: existing } = await supabase
          .from("products")
          .select("id")
          .eq("sku", productData.sku)
          .single();

        if (existing && options.update_existing) {
          // Atualizar
          const { error } = await supabase
            .from("products")
            .update(productData)
            .eq("id", existing.id);
          if (error) throw error;
        } else if (!existing) {
          // Inserir
          const { error } = await supabase.from("products").insert(productData);
          if (error) throw error;
        }

        result.success++;
      } catch (error: any) {
        result.errors++;
        result.errorDetails.push({ row: rowIndex, error: error.message });
        if (!options.skip_errors) throw error;
      }
    }
  }

  return result;
}

// Importar recebimento
async function importReceiving(
  supabase: any,
  receiving: ReceivingImport,
  options: { skip_errors: boolean }
): Promise<ImportResult> {
  const result: ImportResult = { total: receiving.items.length, success: 0, errors: 0, errorDetails: [] };

  // Buscar fornecedor
  const { data: supplier } = await supabase
    .from("suppliers")
    .select("id")
    .eq("code", receiving.supplier_code)
    .single();

  if (!supplier) {
    throw new Error(`Fornecedor não encontrado: ${receiving.supplier_code}`);
  }

  // Criar documento de recebimento
  const { data: receipt, error: receiptError } = await supabase
    .from("receiving_documents")
    .insert({
      document_number: receiving.document_number,
      supplier_id: supplier.id,
      status: "pending",
      expected_items: receiving.items.length,
    })
    .select()
    .single();

  if (receiptError) throw receiptError;

  // Processar itens
  for (let i = 0; i < receiving.items.length; i++) {
    const item = receiving.items[i];

    try {
      // Buscar produto
      const { data: product } = await supabase
        .from("products")
        .select("id")
        .eq("sku", item.sku)
        .single();

      if (!product) {
        throw new Error(`Produto não encontrado: ${item.sku}`);
      }

      // Buscar localização
      let locationId = null;
      if (item.location_code) {
        const { data: location } = await supabase
          .from("locations")
          .select("id")
          .eq("code", item.location_code)
          .single();
        locationId = location?.id;
      }

      // Inserir item de recebimento
      const { error } = await supabase.from("receiving_items").insert({
        document_id: receipt.id,
        product_id: product.id,
        expected_quantity: item.quantity,
        received_quantity: 0,
        lot_number: item.lot_number,
        expiry_date: item.expiry_date,
        location_id: locationId,
        status: "pending",
      });

      if (error) throw error;
      result.success++;
    } catch (error: any) {
      result.errors++;
      result.errorDetails.push({ row: i + 1, error: error.message });
      if (!options.skip_errors) throw error;
    }
  }

  return result;
}

// Importar localizações
async function importLocations(
  supabase: any,
  locations: any[],
  options: { skip_errors: boolean; update_existing: boolean }
): Promise<ImportResult> {
  const result: ImportResult = { total: locations.length, success: 0, errors: 0, errorDetails: [] };

  for (let i = 0; i < locations.length; i++) {
    const location = locations[i];

    try {
      if (!location.code || !location.name) {
        throw new Error("Código e Nome são obrigatórios");
      }

      const locationData = {
        code: location.code.trim(),
        name: location.name.trim(),
        zone: location.zone,
        aisle: location.aisle,
        rack: location.rack,
        level: location.level,
        position: location.position,
        type: location.type || "storage",
        capacity: location.capacity,
        is_active: true,
      };

      const { data: existing } = await supabase
        .from("locations")
        .select("id")
        .eq("code", locationData.code)
        .single();

      if (existing && options.update_existing) {
        await supabase.from("locations").update(locationData).eq("id", existing.id);
      } else if (!existing) {
        await supabase.from("locations").insert(locationData);
      }

      result.success++;
    } catch (error: any) {
      result.errors++;
      result.errorDetails.push({ row: i + 1, error: error.message });
      if (!options.skip_errors) throw error;
    }
  }

  return result;
}

// Importar ajuste de estoque
async function importStockAdjustment(
  supabase: any,
  adjustments: any[],
  options: { skip_errors: boolean }
): Promise<ImportResult> {
  const result: ImportResult = { total: adjustments.length, success: 0, errors: 0, errorDetails: [] };

  for (let i = 0; i < adjustments.length; i++) {
    const adj = adjustments[i];

    try {
      // Buscar produto
      const { data: product } = await supabase
        .from("products")
        .select("id")
        .eq("sku", adj.sku)
        .single();

      if (!product) throw new Error(`Produto não encontrado: ${adj.sku}`);

      // Buscar localização
      const { data: location } = await supabase
        .from("locations")
        .select("id")
        .eq("code", adj.location_code)
        .single();

      if (!location) throw new Error(`Localização não encontrada: ${adj.location_code}`);

      // Chamar função de movimento de estoque
      const response = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/stock-movement`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({
          action: "create_movement",
          data: {
            product_id: product.id,
            to_location_id: location.id,
            quantity: adj.quantity,
            type: "adjustment",
            notes: adj.notes || "Ajuste via importação",
            user_id: adj.user_id,
          },
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      result.success++;
    } catch (error: any) {
      result.errors++;
      result.errorDetails.push({ row: i + 1, error: error.message });
      if (!options.skip_errors) throw error;
    }
  }

  return result;
}
