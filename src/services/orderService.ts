import { supabase } from "@/lib/supabase";

export const orderService = {
  async getAll(filters?: any) {
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
  },

  async getById(id: string) {
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
  },

  async create(order: any, items: any[]) {
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert(order)
      .select()
      .single();

    if (orderError) throw orderError;

    const itemsToInsert = items.map(item => ({
      ...item,
      order_id: newOrder.id
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    return newOrder;
  }
};
