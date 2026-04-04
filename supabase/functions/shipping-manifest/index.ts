import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { shipment_ids, carrier_id, vehicle_plate, driver_name, manifest_date } = await req.json();

    if (!shipment_ids?.length) {
      return new Response(JSON.stringify({ error: "shipment_ids are required" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
    }

    // Buscar envios
    const { data: shipments } = await supabase
      .from("shipments")
      .select("*, order:orders(*, customer:customers(*)), carrier:carriers(*)")
      .in("id", shipment_ids);

    if (!shipments?.length) {
      return new Response(JSON.stringify({ error: "No shipments found" }),
        { status: 404, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
    }

    // Gerar número do manifesto
    const manifestNumber = `MAN-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Calcular totais
    const totalWeight = shipments.reduce((sum, s) => sum + (s.total_weight || 0), 0);
    const totalVolume = shipments.reduce((sum, s) => sum + (s.total_volume || 0), 0);
    const totalValue = shipments.reduce((sum, s) => sum + (s.order?.total || 0), 0);

    // Criar manifesto
    const { data: manifest, error } = await supabase
      .from("shipping_manifests")
      .insert({
        manifest_number: manifestNumber,
        carrier_id,
        vehicle_plate,
        driver_name,
        manifest_date: manifest_date || new Date().toISOString(),
        shipment_count: shipments.length,
        total_weight: totalWeight,
        total_volume: totalVolume,
        total_value: totalValue,
        status: "created",
      })
      .select()
      .single();

    if (error) throw error;

    // Atualizar envios com o manifesto
    await supabase
      .from("shipments")
      .update({ manifest_id: manifest.id, status: "manifested" })
      .in("id", shipment_ids);

    // Gerar documento do manifesto
    const manifestDoc = {
      number: manifestNumber,
      date: manifest.manifest_date,
      carrier: shipments[0]?.carrier?.name,
      vehicle: vehicle_plate,
      driver: driver_name,
      shipments: shipments.map((s) => ({
        tracking: s.tracking_number,
        customer: s.order?.customer?.name,
        address: s.order?.shipping_address,
        weight: s.total_weight,
        volume: s.total_volume,
      })),
      totals: { weight: totalWeight, volume: totalVolume, value: totalValue, count: shipments.length },
    };

    return new Response(
      JSON.stringify({ success: true, manifest_number: manifestNumber, manifest: manifestDoc }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  }
});
