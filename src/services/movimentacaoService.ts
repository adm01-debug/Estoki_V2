import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import type { Movimentacao, MovimentacaoInput, TipoMovimentacao } from "@/types/movimentacao";

export const movimentacaoService = {
  async getAll(options?: { page?: number; pageSize?: number }) {
    const { page = 1, pageSize = 50 } = options || {};
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from("rastreamento_historico")
      .select(
        `
        *,
        produtos (nome),
        lotes (numero_lote),
        profiles:operador_id (nome)
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      logger.error("Erro ao buscar movimentações", error);
      throw error;
    }

    const mapped = (data || []).map((mov) => ({
      id: mov.id,
      tipo: mov.tipo_evento as TipoMovimentacao,
      produto_id: mov.produto_id || undefined,
      produto_nome: mov.produtos?.nome || undefined,
      lote_id: mov.lote_id || undefined,
      lote_numero: mov.lotes?.numero_lote || undefined,
      quantidade: mov.quantidade || 0,
      localizacao: mov.localizacao || undefined,
      descricao: mov.descricao,
      operador_id: mov.operador_id || undefined,
      operador_nome: mov.profiles?.nome || undefined,
      created_at: mov.created_at,
    }));

    return { data: mapped as Movimentacao[], total: count || 0 };
  },

  async registrar(input: MovimentacaoInput & { operador_id: string }): Promise<void> {
    // Resolve posicao code -> UUID when needed
    let toPosicaoId = input.to_posicao_id || null;
    if (!toPosicaoId && input.localizacao) {
      const { data: pos } = await supabase
        .from("posicoes_estoque")
        .select("id")
        .eq("codigo", input.localizacao)
        .maybeSingle();
      if (pos) toPosicaoId = pos.id;
    }

    if (!input.from_posicao_id && !toPosicaoId) {
      throw new Error("Informe posição de origem ou destino");
    }

    if (input.lote_id) {
      // Full move_stock RPC path
      const { error: rpcError } = await supabase.rpc("move_stock", {
        p_lote_id: input.lote_id,
        p_from_posicao_id: input.from_posicao_id || null,
        p_to_posicao_id: toPosicaoId,
        p_quantidade: input.quantidade,
        p_operador_id: input.operador_id,
        p_tipo_evento: input.tipo === "transferencia" ? "armazenamento" : input.tipo,
        p_descricao: input.descricao,
      } as any);
      if (rpcError) {
        logger.error("Erro ao registrar movimentação via RPC", rpcError, { input });
        throw rpcError;
      }
    } else if (input.produto_id && toPosicaoId) {
      // Fallback: upsert direto em estoque_posicao (sem lote)
      const { error: upsertErr } = await supabase.from("estoque_posicao").upsert(
        {
          produto_id: input.produto_id,
          posicao_id: toPosicaoId,
          quantidade: input.quantidade,
          lote_id: null,
        },
        { onConflict: "produto_id,posicao_id" }
      );
      if (upsertErr) {
        logger.error("Erro no upsert de estoque_posicao", upsertErr, { input });
        throw upsertErr;
      }
      // Registra no historico para trilha de auditoria
      await supabase.from("rastreamento_historico").insert([
        {
          produto_id: input.produto_id as any,
          posicao_id: toPosicaoId as any,
          tipo_evento: input.tipo as any,
          quantidade: input.quantidade as any,
          descricao: input.descricao as any,
          operador_id: input.operador_id as any,
        },
      ]);
    } else {
      throw new Error(
        "produto_id + posicao ou lote_id são obrigatórios para registrar movimentação"
      );
    }
  },

  async getByProduto(produtoId: string) {
    const { data, error } = await supabase
      .from("rastreamento_historico")
      .select(
        `
        *,
        produtos (nome),
        lotes (numero_lote),
        profiles:operador_id (nome)
      `
      )
      .eq("produto_id", produtoId)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Erro ao buscar movimentações por produto", error, { produtoId });
      throw error;
    }

    return (data || []).map((mov) => ({
      id: mov.id,
      tipo: mov.tipo_evento as TipoMovimentacao,
      produto_id: mov.produto_id || undefined,
      produto_nome: mov.produtos?.nome || undefined,
      lote_id: mov.lote_id || undefined,
      lote_numero: mov.lotes?.numero_lote || undefined,
      quantidade: mov.quantidade || 0,
      localizacao: mov.localizacao || undefined,
      descricao: mov.descricao,
      operador_id: mov.operador_id || undefined,
      operador_nome: mov.profiles?.nome || undefined,
      created_at: mov.created_at,
    })) as Movimentacao[];
  },

  async getByLote(loteId: string) {
    const { data, error } = await supabase
      .from("rastreamento_historico")
      .select(
        `
        *,
        produtos (nome),
        lotes (numero_lote),
        profiles:operador_id (nome)
      `
      )
      .eq("lote_id", loteId)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Erro ao buscar movimentações por lote", error, { loteId });
      throw error;
    }

    return (data || []).map((mov) => ({
      id: mov.id,
      tipo: mov.tipo_evento as TipoMovimentacao,
      produto_id: mov.produto_id || undefined,
      produto_nome: mov.produtos?.nome || undefined,
      lote_id: mov.lote_id || undefined,
      lote_numero: mov.lotes?.numero_lote || undefined,
      quantidade: mov.quantidade || 0,
      localizacao: mov.localizacao || undefined,
      descricao: mov.descricao,
      operador_id: mov.operador_id || undefined,
      operador_nome: mov.profiles?.nome || undefined,
      created_at: mov.created_at,
    })) as Movimentacao[];
  },
};
