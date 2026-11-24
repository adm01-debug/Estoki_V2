import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import type { Produto, ProdutoInsert, ProdutoUpdate, ProdutoComEstoque } from "@/types/product";

export const productService = {
  async getAll(options?: { page?: number; pageSize?: number; search?: string; curva?: string }) {
    const { page = 1, pageSize = 100, search, curva } = options || {};
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from("produtos").select("*", { count: "exact" }).order("nome");

    const termo = (search || "").trim();
    if (termo) {
      // PostgREST interpreta virgula e parenteses como sintaxe de `or`, entao o termo é limpo.
      const limpo = termo
        .replace(/[%,()*\\]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (limpo) {
        query = query.or(`nome.ilike.%${limpo}%,sku.ilike.%${limpo}%`);
      }
    }
    if (curva && curva !== "todos") {
      query = query.eq("curva_abc", curva);
    }

    const { data, error, count } = await query.range(from, to);

    if (error) {
      logger.error("Erro ao buscar produtos", error);
      throw error;
    }
    return { data: data as Produto[], total: count || 0 };
  },

  async contarPorCurva() {
    const curvas = ["A", "B", "C"] as const;
    const contar = async (curva?: string) => {
      let query = supabase.from("produtos").select("id", { count: "exact", head: true });
      if (curva) query = query.eq("curva_abc", curva);
      const { count, error } = await query;
      if (error) {
        logger.error("Erro ao contar produtos por curva", error, { curva });
        throw error;
      }
      return count || 0;
    };

    const [total, a, b, c] = await Promise.all([contar(), ...curvas.map((curva) => contar(curva))]);
    return { total, A: a, B: b, C: c };
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("produtos")
      .select(
        `
        *,
        estoque:estoque_posicao(
          quantidade,
          posicao:posicoes_estoque(codigo, zona)
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      logger.error("Erro ao buscar produto por ID", error, { id });
      throw error;
    }
    return data as ProdutoComEstoque;
  },

  async create(produto: ProdutoInsert) {
    const { data, error } = await supabase.from("produtos").insert(produto).select().single();

    if (error) {
      logger.error("Erro ao criar produto", error, { produto });
      throw error;
    }
    return data as Produto;
  },

  async update(id: string, updates: ProdutoUpdate) {
    const { data, error } = await supabase
      .from("produtos")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      logger.error("Erro ao atualizar produto", error, { id, updates });
      throw error;
    }
    return data as Produto;
  },

  async bulkCreate(produtos: ProdutoInsert[]) {
    const { data, error } = await supabase.from("produtos").insert(produtos).select();

    if (error) {
      logger.error("Erro ao criar produtos em massa", error);
      throw error;
    }
    return data as Produto[];
  },

  async getHistory(produtoId: string) {
    const { data, error } = await supabase
      .from("rastreamento_historico")
      .select("*")
      .eq("produto_id", produtoId)
      .order("data_evento", { ascending: false });

    if (error) {
      logger.error("Erro ao buscar histórico do produto", error, { produtoId });
      throw error;
    }
    return data;
  },
};
