import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import type { Produto, ProdutoInsert, ProdutoUpdate, ProdutoComEstoque } from "@/types/product";

export const productService = {
  async getAll(options?: { page?: number; pageSize?: number }) {
    const { page = 1, pageSize = 100 } = options || {};
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from("produtos")
      .select("*", { count: "exact" })
      .order("nome")
      .range(from, to);

    if (error) {
      logger.error("Erro ao buscar produtos", error);
      throw error;
    }
    return { data: data as Produto[], total: count || 0 };
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

  async delete(id: string) {
    const { error } = await supabase.from("produtos").delete().eq("id", id);

    if (error) {
      logger.error("Erro ao deletar produto", error, { id });
      throw error;
    }
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
