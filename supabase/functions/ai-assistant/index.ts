import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context } = await req.json();
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `Você é o Assistente IA do ESTOKI WMS - um sistema de gestão de armazém. 
Você analisa dados de estoque e fornece insights operacionais em português brasileiro.

Contexto atual do armazém:
${JSON.stringify(context, null, 2)}

Suas capacidades:
1. Analisar níveis de estoque e identificar produtos críticos
2. Prever rupturas baseado em giro mensal vs estoque atual
3. Sugerir reposição com base em ponto de pedido e lead time
4. Identificar produtos parados (sem giro) para ações
5. Recomendar otimizações de layout baseado na curva ABC
6. Alertar sobre lotes próximos ao vencimento

Responda de forma concisa, direta e acionável. Use emojis para destacar pontos importantes.
Quando possível, forneça números específicos e ações concretas.`;

    const response = await fetch('https://ai.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Não foi possível gerar uma resposta.';

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('AI Assistant error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
