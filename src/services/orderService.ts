 import { supabase } from "@/lib/supabase";
 import { logger } from "@/utils/logger";
 import { Database } from "@/integrations/supabase/types";

 type Order = Database['public']['Tables']['orders']['Row'];
 type OrderInsert = Database['public']['Tables']['orders']['Insert'];
 type OrderItemInsert = Database['public']['Tables']['order_items']['Insert'];

 interface OrderFilters extends Record<string, unknown> {
   status?: Database['public']['Tables']['orders']['Row']['status'];
 }

export const orderService = {
   async getAll(filters?: OrderFilters) {
     try {
       let query = supabase
         .from("orders")
         .select(`
           *,
           itens:order_items(
             *,
             produto:produtos(nome, sku)
           )
         `)
         .order("created_at", { ascending: false });

       if (filters?.status) query = query.eq("status", filters.status);

       const { data, error } = await query;
       if (error) throw error;
       return data;
     } catch (error) {
       logger.error("Erro ao buscar pedidos", error, filters);
       throw error;
     }
   },

  async getById(id: string) {
     try {
       const { data, error } = await supabase
         .from("orders")
         .select(`
           *,
           itens:order_items(
             *,
             produto:produtos(*)
           )
         `)
         .eq("id", id)
         .single();
       if (error) throw error;
       return data;
     } catch (error) {
       logger.error("Erro ao buscar pedido por ID", error, { id });
       throw error;
     }
   },

   async create(order: OrderInsert, items: Omit<OrderItemInsert, 'order_id'>[]) {
     try {
       const { data: newOrder, error: orderError } = await supabase
         .from("orders")
         .insert(order)
         .select()
         .single();

       if (orderError) throw orderError;

       const itemsToInsert: OrderItemInsert[] = items.map(item => ({
         ...item,
         order_id: newOrder.id
       }));

       const { error: itemsError } = await supabase
         .from("order_items")
         .insert(itemsToInsert);

       if (itemsError) throw itemsError;

       logger.info("Pedido criado com sucesso", { orderId: newOrder.id });
       return newOrder;
     } catch (error) {
       logger.error("Erro ao criar pedido", error, { order });
       throw error;
     }
  }
};
