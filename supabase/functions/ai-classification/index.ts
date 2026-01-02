import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ClassificationRequest {
  text: string;
  categories: string[];
  model?: "simple" | "advanced";
}

interface ClassificationResult {
  category: string;
  confidence: number;
  all_scores: Record<string, number>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { text, categories, model = "simple" }: ClassificationRequest = await req.json();

    if (!text || !categories || categories.length === 0) {
      throw new Error("text e categories são obrigatórios");
    }

    // Classificação simples baseada em keywords
    const scores: Record<string, number> = {};
    const textLower = text.toLowerCase();

    // Keywords por categoria (expandir conforme necessidade)
    const categoryKeywords: Record<string, string[]> = {
      "eletronicos": ["celular", "notebook", "tablet", "tv", "computador", "fone", "cabo"],
      "vestuario": ["roupa", "camisa", "calça", "vestido", "sapato", "tenis", "blusa"],
      "alimentos": ["comida", "bebida", "lanche", "frutas", "legumes", "carne", "leite"],
      "escritorio": ["caneta", "papel", "caderno", "agenda", "pasta", "grampo", "clips"],
      "limpeza": ["sabão", "detergente", "desinfetante", "vassoura", "pano", "esponja"],
      "ferramentas": ["martelo", "chave", "parafuso", "furadeira", "serra", "alicate"],
    };

    categories.forEach((cat) => {
      const catLower = cat.toLowerCase();
      let score = 0;

      // Verifica keywords conhecidas
      const keywords = categoryKeywords[catLower] || [];
      keywords.forEach((keyword) => {
        if (textLower.includes(keyword)) {
          score += 0.3;
        }
      });

      // Verifica se o nome da categoria aparece no texto
      if (textLower.includes(catLower)) {
        score += 0.5;
      }

      // Similaridade básica de caracteres
      const words = textLower.split(/\s+/);
      words.forEach((word) => {
        if (word.length > 3 && catLower.includes(word.substring(0, 3))) {
          score += 0.1;
        }
      });

      scores[cat] = Math.min(score, 1);
    });

    // Encontra categoria com maior score
    let bestCategory = categories[0];
    let bestScore = 0;

    Object.entries(scores).forEach(([cat, score]) => {
      if (score > bestScore) {
        bestScore = score;
        bestCategory = cat;
      }
    });

    // Se nenhuma categoria teve match, usar primeira como default
    if (bestScore === 0) {
      scores[categories[0]] = 0.1;
      bestScore = 0.1;
    }

    const result: ClassificationResult = {
      category: bestCategory,
      confidence: bestScore,
      all_scores: scores,
    };

    // Log para auditoria
    await supabaseClient.from("ai_logs").insert({
      function_name: "ai-classification",
      input: { text, categories, model },
      output: result,
      created_at: new Date().toISOString(),
    }).catch(() => {});

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
