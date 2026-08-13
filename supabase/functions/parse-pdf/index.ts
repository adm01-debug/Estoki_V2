import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const extractImages = formData.get("extract_images") === "true";

    if (!file) {
      throw new Error("Arquivo PDF é obrigatório");
    }

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Parser básico de PDF para extrair texto
    const decoder = new TextDecoder("latin1");
    const content = decoder.decode(bytes);

    // Extrair texto entre marcadores de stream
    const textMatches: string[] = [];
    const streamRegex = /stream\s*([\s\S]*?)\s*endstream/g;
    let match;

    while ((match = streamRegex.exec(content)) !== null) {
      const streamContent = match[1];
      // Extrair texto visível (simplificado)
      const textRegex = /\(([^)]+)\)/g;
      let textMatch;
      while ((textMatch = textRegex.exec(streamContent)) !== null) {
        const text = textMatch[1].replace(/\\n/g, "\n").replace(/\\\(/g, "(").replace(/\\\)/g, ")");
        if (text.trim()) textMatches.push(text.trim());
      }
    }

    // Extrair metadados
    const titleMatch = content.match(/\/Title\s*\(([^)]+)\)/);
    const authorMatch = content.match(/\/Author\s*\(([^)]+)\)/);
    const creationMatch = content.match(/\/CreationDate\s*\(([^)]+)\)/);
    const pagesMatch = content.match(/\/Count\s+(\d+)/);

    const result = {
      filename: file.name,
      size_bytes: bytes.length,
      metadata: {
        title: titleMatch?.[1] || null,
        author: authorMatch?.[1] || null,
        creation_date: creationMatch?.[1] || null,
        pages: pagesMatch ? parseInt(pagesMatch[1]) : null,
      },
      text_content: textMatches.join(" ").substring(0, 10000),
      text_length: textMatches.join(" ").length,
      extracted_blocks: textMatches.length,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      status: 400,
    });
  }
});
