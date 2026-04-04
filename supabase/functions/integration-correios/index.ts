import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });

  try {
    const { action, ...params } = await req.json();

    let result;
    switch (action) {
      case "cep": {
        // Consulta CEP via ViaCEP (gratuito)
        const response = await fetch(`https://viacep.com.br/ws/${params.cep}/json/`);
        const data = await response.json();
        if (data.erro) throw new Error("CEP não encontrado");
        result = {
          cep: data.cep, street: data.logradouro, neighborhood: data.bairro,
          city: data.localidade, state: data.uf, ibge: data.ibge,
        };
        break;
      }

      case "frete": {
        // Simulação de cálculo de frete
        const { cep_origem, cep_destino, peso, comprimento, altura, largura, servicos = ["04014", "04510"] } = params;
        
        const results = servicos.map((servico: string) => {
          const basePrice = peso * 0.5 + (comprimento * altura * largura) / 6000;
          const prices: Record<string, number> = { "04014": basePrice * 1.5, "04510": basePrice };
          const days: Record<string, number> = { "04014": 3, "04510": 8 };
          const names: Record<string, string> = { "04014": "SEDEX", "04510": "PAC" };
          
          return {
            codigo: servico, nome: names[servico] || servico,
            valor: (prices[servico] || basePrice).toFixed(2),
            prazo: days[servico] || 10,
          };
        });
        result = { cotacoes: results };
        break;
      }

      case "rastreio": {
        // Simulação de rastreamento
        result = {
          codigo: params.codigo,
          eventos: [
            { data: new Date().toISOString(), local: "São Paulo/SP", status: "Objeto em trânsito" },
            { data: new Date(Date.now() - 86400000).toISOString(), local: "Curitiba/PR", status: "Objeto postado" },
          ],
        };
        break;
      }

      default:
        throw new Error("Ação inválida. Use: cep, frete, rastreio");
    }

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }, status: 400 });
  }
});
