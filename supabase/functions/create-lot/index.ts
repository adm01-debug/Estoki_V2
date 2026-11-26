import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { exigirSessao } from "../_shared/auth.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { CreateLotSchema, validateInput } from "../_shared/schemas.ts";

const json = (req: Request, corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), {
    status,
    headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  // Insercao de lote: exige sessao, como as demais edges de escrita.
  const semSessao = await exigirSessao(req);
  if (semSessao) return semSessao;
  try {
    const body = await req.json().catch(() => ({}));
    const v = validateInput(CreateLotSchema, body);
    if (!v.success) return json(req, v, 400);

    // supplierId nao tem coluna em lotes: o lote guarda o nome do fornecedor do produto
    // (mesma origem da tela de recebimento, produtos.fornecedor_principal).
    const { lotNumber, productId, quantity, manufacturingDate, expirationDate } = v.data;

    // O cliente carrega a sessao do chamador, entao a RLS de lotes decide o que pode
    // (insercao apenas para admin/supervisor) e o tenant vem do proprio usuario.
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } }
    );

    const { data: produto, error: erroProduto } = await supabase
      .from("produtos")
      .select("fornecedor_principal")
      .eq("id", productId)
      .maybeSingle();
    if (erroProduto) throw erroProduto;
    if (!produto) return json(req, { error: "produto nao encontrado" }, 404);

    const { data: lot, error } = await supabase
      .from("lotes")
      .insert({
        numero_lote: lotNumber,
        produto_id: productId,
        quantidade_inicial: quantity,
        quantidade_atual: quantity,
        fornecedor: (produto as { fornecedor_principal: string | null }).fornecedor_principal,
        data_fabricacao: manufacturingDate ?? null,
        data_validade: expirationDate ?? null,
        status: "aguardando",
      })
      .select()
      .single();
    if (error) {
      // 42501 = RLS: quem nao e admin/supervisor nao cria lote, igual a tela.
      if ((error as { code?: string }).code === "42501") {
        return json(req, { error: "sem permissao para criar lote" }, 403);
      }
      throw error;
    }
    return json(req, { lot });
  } catch (error) {
    return json(req, { error: (error as Error).message }, 400);
  }
});
