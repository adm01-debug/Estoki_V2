import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

import { SCANNER_OCR_PROMPT } from "../_shared/prompts.ts";
import { exigirSessao } from "../_shared/auth.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }
  const recusaSemSessao = await exigirSessao(req);
  if (recusaSemSessao) return recusaSemSessao;

  try {
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const formData = await req.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      throw new Error("Nenhuma imagem fornecida");
    }

    console.log("Processando imagem para OCR:", imageFile.name, imageFile.size);

    // Converter imagem para base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
    );

    // Usar Gemini Vision para OCR
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: SCANNER_OCR_PROMPT,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${imageFile.type};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 2000,
        temperature: 0.2,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("Erro AI Gateway:", errorText);
      throw new Error(`Erro na API de IA: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    console.log("Resposta OCR recebida");

    // Extrair JSON da resposta
    let resultado = {
      tipo_documento: "outro",
      textos_extraidos: [] as string[],
      dados_estruturados: {},
      confianca: 50,
    };

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        resultado = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error("Erro ao parsear resposta:", parseError);
      // Extrair textos da resposta como fallback
      resultado.textos_extraidos = content.split("\n").filter((line: string) => line.trim());
    }

    return new Response(
      JSON.stringify({
        success: true,
        ...resultado,
      }),
      {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Erro no OCR:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
