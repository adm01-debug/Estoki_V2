import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EDIDocument {
  type: "ORDERS" | "DESADV" | "INVOIC" | "RECADV" | "INVRPT";
  content: string;
  format?: "EDIFACT" | "X12" | "FLATFILE";
  sender_id?: string;
  receiver_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const edi: EDIDocument = await req.json();

    if (!edi.type || !edi.content) {
      throw new Error("type e content são obrigatórios");
    }

    const lines = edi.content.split("\n").filter(l => l.trim());
    const parsedData: any = { type: edi.type, segments: [], items: [] };

    // Parser básico de EDI
    lines.forEach((line, index) => {
      const parts = line.split(/[+:~]/);
      const segment = parts[0];

      parsedData.segments.push({
        line: index + 1,
        segment,
        elements: parts.slice(1),
      });

      // Extrair dados comuns
      if (segment === "UNB") parsedData.interchange_ref = parts[5];
      if (segment === "BGM") parsedData.document_number = parts[2];
      if (segment === "DTM") parsedData.date = parts[1];
      if (segment === "LIN") {
        parsedData.items.push({
          line_number: parts[1],
          product_id: parts[3],
          quantity: null,
        });
      }
      if (segment === "QTY" && parsedData.items.length > 0) {
        parsedData.items[parsedData.items.length - 1].quantity = parseInt(parts[1]) || 0;
      }
    });

    // Salvar documento processado
    const { data, error } = await supabase
      .from("edi_documents")
      .insert({
        document_type: edi.type,
        format: edi.format || "EDIFACT",
        sender_id: edi.sender_id,
        receiver_id: edi.receiver_id,
        raw_content: edi.content,
        parsed_data: parsedData,
        status: "processed",
        processed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({
      success: true,
      document_id: data.id,
      parsed: parsedData,
      segments_count: parsedData.segments.length,
      items_count: parsedData.items.length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
