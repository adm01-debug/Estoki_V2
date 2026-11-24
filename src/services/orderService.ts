import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { exigirLinhaAfetada } from "@/lib/exigirLinhaAfetada";
import { Database } from "@/integrations/supabase/types";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
type OrderItemInsert = Database["public"]["Tables"]["order_items"]["Insert"];

interface OrderFilters extends Record<string, unknown> {
  status?: Database["public"]["Tables"]["orders"]["Row"]["status"];
}

export const orderService = {
  async getAll(filters?: OrderFilters & { page?: number; pageSize?: number }) {
    const { page = 1, pageSize = 20 } = filters || {};
    try {
      let query = supabase
        .from("orders")
        .select(
          `
          *,
          itens:order_items(
            *,
            produto:produtos(nome, sku)
          )
        `,
          { count: "exact" }
        )
        .order("created_at", { ascending: false });

      if (filters?.status) query = query.eq("status", filters.status);

      const from = (page - 1) * pageSize;
      query = query.range(from, from + pageSize - 1);

      const { data, error, count } = await query;

      if (error) throw error;
      return {
        data,
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    } catch (error) {
      logger.error("Erro ao buscar pedidos", error, filters);
      throw error;
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          itens:order_items(
            *,
            produto:produtos(*)
          )
        `
        )
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      logger.error("Erro ao buscar pedido por ID", error, { id });
      throw error;
    }
  },

  /** A coluna `warehouse_id` existe no banco, mas não nos tipos gerados. */
  /** UPDATE barrado pela RLS afeta 0 linhas "com sucesso": exigirLinhaAfetada evita sucesso falso. */
  async updateStatus(id: string, status: NonNullable<Order["status"]>) {
    try {
      const resultado = await supabase.from("orders").update({ status }).eq("id", id).select("id");
      exigirLinhaAfetada(resultado, "alterar o status do pedido");
      return resultado.data?.[0] ?? null;
    } catch (error) {
      logger.error("Erro ao alterar status do pedido", error, { id, status });
      throw error;
    }
  },

  /** A coluna `warehouse_id` existe no banco, mas não nos tipos gerados. */
  async create(
    order: OrderInsert & { warehouse_id?: string | null },
    items: Omit<OrderItemInsert, "order_id">[]
  ) {
    try {
      // `warehouse_id` existe no banco mas não nos tipos gerados; o insert o aceita.
      const { data: newOrder, error: orderError } = await supabase
        .from("orders")
        .insert(order as OrderInsert)
        .select()
        .single();

      if (orderError) throw orderError;

      if (items.length === 0) {
        logger.info("Pedido criado sem itens", { orderId: newOrder.id });
        return newOrder;
      }

      const itemsToInsert: OrderItemInsert[] = items.map((item) => ({
        ...item,
        order_id: newOrder.id,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(itemsToInsert);

      if (itemsError) {
        // Sem desfazer, o pedido ficaria criado e vazio, e a tela diria que a criação falhou.
        try {
          await supabase.from("order_items").delete().eq("order_id", newOrder.id);
          await supabase.from("orders").delete().eq("id", newOrder.id);
        } catch (erroLimpeza) {
          logger.error("Falha ao desfazer pedido sem itens", erroLimpeza, { orderId: newOrder.id });
        }
        throw itemsError;
      }

      logger.info("Pedido criado com sucesso", { orderId: newOrder.id });
      return newOrder;
    } catch (error) {
      logger.error("Erro ao criar pedido", error, { order });
      throw error;
    }
  },
};
