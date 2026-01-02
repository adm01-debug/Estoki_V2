import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SentimentResult {
  sentiment: "positive" | "negative" | "neutral";
  score: number;
  confidence: number;
  keywords: string[];
}

const positiveWords = ["bom", "ótimo", "excelente", "perfeito", "maravilhoso", "incrível", "satisfeito", "recomendo", "rápido", "eficiente", "adorei", "amei", "parabéns", "top", "melhor", "qualidade", "profissional"];
const negativeWords = ["ruim", "péssimo", "horrível", "terrível", "insatisfeito", "lento", "demora", "problema", "defeito", "quebrado", "errado", "nunca", "pior", "decepção", "fraude", "golpe", "reclamar"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, language = "pt" } = await req.json();

    if (!text) {
      throw new Error("text é obrigatório");
    }

    const textLower = text.toLowerCase();
    const words = textLower.split(/\s+/);

    let positiveScore = 0;
    let negativeScore = 0;
    const foundKeywords: string[] = [];

    words.forEach((word) => {
      const cleanWord = word.replace(/[.,!?;:]/g, "");
      
      if (positiveWords.some((pw) => cleanWord.includes(pw))) {
        positiveScore++;
        foundKeywords.push(cleanWord);
      }
      if (negativeWords.some((nw) => cleanWord.includes(nw))) {
        negativeScore++;
        foundKeywords.push(cleanWord);
      }
    });

    // Negações invertem o sentimento
    const negations = ["não", "nunca", "nem", "jamais"];
    negations.forEach((neg) => {
      if (textLower.includes(neg)) {
        const temp = positiveScore;
        positiveScore = negativeScore * 0.5;
        negativeScore = temp * 0.5;
      }
    });

    const totalScore = positiveScore + negativeScore;
    let sentiment: "positive" | "negative" | "neutral" = "neutral";
    let score = 0;

    if (totalScore > 0) {
      score = (positiveScore - negativeScore) / totalScore;
      if (score > 0.2) sentiment = "positive";
      else if (score < -0.2) sentiment = "negative";
    }

    const confidence = totalScore > 0 ? Math.min(totalScore / 5, 1) : 0.3;

    const result: SentimentResult = {
      sentiment,
      score: Math.round(score * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
      keywords: [...new Set(foundKeywords)].slice(0, 10),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
