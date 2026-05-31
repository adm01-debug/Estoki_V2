import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { NfeImportSchema, validateInput } from "../_shared/schemas.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  const headers = { ...getCorsHeaders(req), "Content-Type": "application/json" };

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers,
      });
    }

    const body = await req.json();
    const validation = validateInput(NfeImportSchema, body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: validation.error, details: validation.details }),
        { status: 400, headers }
      );
    }

    const { xml_content, access_key } = validation.data;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let nfeData: any = {};

    if (xml_content) {
      const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
      const xmlObj = parser.parse(xml_content);

      const infNFe = xmlObj.nfeProc?.NFe?.infNFe || xmlObj.NFe?.infNFe;
      if (!infNFe) {
        throw new Error("Formato de XML de NF-e inválido ou incompleto");
      }

      const ide = infNFe.ide;
      const emit = infNFe.emit;
      const det = Array.isArray(infNFe.det) ? infNFe.det : [infNFe.det];
      const total = infNFe.total?.ICMSTot;

      nfeData = {
        access_key: infNFe["@_Id"]?.replace("NFe", "") || access_key,
        number: ide.nNF,
        series: ide.serie,
        issue_date: ide.dhEmi || new Date().toISOString(),
        operation_type: ide.tpNF === 0 ? "entrada" : "saida",
        emitter: { cnpj: emit.CNPJ || emit.CPF, name: emit.xNome },
        items: det.map((d: any) => ({
          code: d.prod.cProd,
          description: d.prod.xProd,
          quantity: parseFloat(d.prod.qCom),
          unit_price: parseFloat(d.prod.vUnCom),
          total: parseFloat(d.prod.vProd),
        })),
        totals: { products: parseFloat(total?.vProd || 0), total: parseFloat(total?.vNF || 0) },
      };
    } else {
      // Logic for fetching by access_key if content is not provided
      // For now, if no xml_content, we fallback to a minimal record or error
      throw new Error("xml_content é obrigatório para processamento completo neste estágio");
    }

    const { data: nfe, error: nfeError } = await supabase
      .from("nfe_documents")
      .upsert(
        {
          access_key: nfeData.access_key,
          number: nfeData.number,
          series: nfeData.series,
          issue_date: nfeData.issue_date,
          operation_type: nfeData.operation_type,
          emitter_cnpj: nfeData.emitter.cnpj,
          emitter_name: nfeData.emitter.name,
          total_products: nfeData.totals.products,
          total_nfe: nfeData.totals.total,
          status: "imported",
          xml_content: xml_content ?? null,
          imported_at: new Date().toISOString(),
        },
        { onConflict: "access_key" }
      )
      .select()
      .single();

    if (nfeError) throw nfeError;

    if (nfeData.items) {
      // Clear existing items if re-importing
      await supabase.from("nfe_items").delete().eq("nfe_id", nfe.id);

      const itemsToInsert = nfeData.items.map((item: any) => ({
        nfe_id: nfe.id,
        product_code: item.code,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total,
      }));

      const { error: itemsError } = await supabase.from("nfe_items").insert(itemsToInsert);
      if (itemsError) throw itemsError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        nfe_id: nfe?.id,
        access_key: nfeData.access_key,
        items_imported: nfeData.items.length,
      }),
      { headers }
    );
  } catch (error) {
    console.error("NFE Import error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
});
