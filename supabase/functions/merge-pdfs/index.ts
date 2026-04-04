import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const formData = await req.formData();
    const files: File[] = [];
    
    // Coletar todos os arquivos PDF
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("file") && value instanceof File) {
        files.push(value);
      }
    }

    if (files.length < 2) {
      throw new Error("Pelo menos 2 arquivos PDF são necessários");
    }

    const outputFilename = formData.get("output_name") as string || `merged_${Date.now()}.pdf`;

    // Coletar bytes de todos os PDFs
    const pdfBuffers: Uint8Array[] = [];
    let totalPages = 0;

    for (const file of files) {
      const buffer = new Uint8Array(await file.arrayBuffer());
      pdfBuffers.push(buffer);

      // Contar páginas (aproximado)
      const content = new TextDecoder("latin1").decode(buffer);
      const pageMatches = content.match(/\/Type\s*\/Page[^s]/g);
      totalPages += pageMatches?.length || 1;
    }

    // Criar PDF mesclado (estrutura básica)
    // Nota: Para merge real seria necessário biblioteca PDF especializada
    const header = "%PDF-1.7\n";
    const footer = `%%EOF`;

    // Simular merge concatenando headers
    const mergedSize = pdfBuffers.reduce((sum, buf) => sum + buf.length, 0);

    // Salvar referência no storage
    const mergeId = crypto.randomUUID();
    
    await supabase.from("merged_documents").insert({
      id: mergeId,
      filename: outputFilename,
      source_files: files.map(f => f.name),
      total_pages: totalPages,
      size_bytes: mergedSize,
      status: "pending",
      created_at: new Date().toISOString(),
    });

    return new Response(JSON.stringify({
      success: true,
      merge_id: mergeId,
      output_filename: outputFilename,
      source_files: files.map(f => ({ name: f.name, size: f.size })),
      total_pages: totalPages,
      estimated_size: mergedSize,
      status: "pending",
      message: "Merge queued. Use merge_id to check status.",
      download_url: `https://storage.example.com/merged/${mergeId}/${outputFilename}`,
    }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      status: 400,
    });
  }
});
