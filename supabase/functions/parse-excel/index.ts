import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const sheetName = formData.get("sheet") as string;
    const headerRow = parseInt(formData.get("header_row") as string) || 1;

    if (!file) {
      throw new Error("Arquivo Excel é obrigatório");
    }

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Para XLSX, precisamos descompactar o ZIP e ler os XMLs
    // Este é um parser simplificado para arquivos CSV disfarçados ou XLS antigos
    
    const decoder = new TextDecoder("utf-8");
    let content = decoder.decode(bytes);

    // Tentar detectar se é CSV
    const isCSV = file.name.endsWith(".csv") || content.includes(",") && content.includes("\n");

    let rows: string[][] = [];
    let headers: string[] = [];

    if (isCSV) {
      const lines = content.split("\n").filter(l => l.trim());
      rows = lines.map(line => {
        // Parser simples de CSV (não lida com todos os casos)
        const values: string[] = [];
        let current = "";
        let inQuotes = false;

        for (const char of line) {
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === "," && !inQuotes) {
            values.push(current.trim());
            current = "";
          } else {
            current += char;
          }
        }
        values.push(current.trim());
        return values;
      });

      headers = rows[headerRow - 1] || [];
    } else {
      // Para XLSX real, seria necessário biblioteca especializada
      // Retornamos indicação de que precisa de processamento especial
      return new Response(JSON.stringify({
        error: "XLSX requires specialized parsing",
        suggestion: "Use CSV format or process on client-side with xlsx library",
        filename: file.name,
        size_bytes: bytes.length,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Converter para objetos
    const data = rows.slice(headerRow).map((row, index) => {
      const obj: Record<string, any> = { _row: index + headerRow + 1 };
      headers.forEach((header, i) => {
        obj[header || `col_${i}`] = row[i] || null;
      });
      return obj;
    });

    return new Response(JSON.stringify({
      filename: file.name,
      size_bytes: bytes.length,
      headers,
      total_rows: rows.length,
      data_rows: data.length,
      preview: data.slice(0, 10),
      data,
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
