import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
  
  try {
    const { type, data } = await req.json();
    
    switch (type) {
      case "product_label": {
        const { product_id, quantity = 1, template = "default" } = data;
        const { data: product } = await supabase.from("products").select("*").eq("id", product_id).single();
        if (!product) throw new Error("Produto nao encontrado");
        const labels = Array.from({ length: quantity }, () => ({
          sku: product.sku, name: product.name, barcode: product.barcode || product.sku, price: product.sell_price, template
        }));
        return new Response(JSON.stringify({ success: true, labels }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      case "location_label": {
        const { location_id } = data;
        const { data: location } = await supabase.from("locations").select("*").eq("id", location_id).single();
        if (!location) throw new Error("Localizacao nao encontrada");
        return new Response(JSON.stringify({ success: true, label: { code: location.code, name: location.name, zone: location.zone, barcode: location.code } }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      case "shipping_label": {
        const { shipment_id } = data;
        const { data: shipment } = await supabase.from("shipments").select("*, order:orders(*, customer:customers(*))").eq("id", shipment_id).single();
        if (!shipment) throw new Error("Envio nao encontrado");
        return new Response(JSON.stringify({ success: true, label: { tracking_code: shipment.tracking_code, recipient: shipment.order?.customer?.name, address: shipment.order?.shipping_address, weight: shipment.weight, carrier: shipment.carrier } }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      default: throw new Error("Tipo de etiqueta desconhecido");
    }
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
