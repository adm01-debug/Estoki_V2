import { supabase } from '@/integrations/supabase/client';
export interface StockMovement { id: string; product_id: string; location_id?: string; type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT'; quantity: number; reference?: string; reason?: string; user_id: string; previous_qty: number; new_qty: number; created_at: string; }
export const stockService = {
  async getMovements(productId?: string, dateRange?: { start: Date; end: Date }) {
    let query = supabase.from('stock_movements').select('*, products(name, sku), locations(code), users(name)');
    if (productId) query = query.eq('product_id', productId);
    if (dateRange) { query = query.gte('created_at', dateRange.start.toISOString()).lte('created_at', dateRange.end.toISOString()); }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data as StockMovement[];
  },
  async createMovement(movement: Omit<StockMovement, 'id' | 'created_at' | 'previous_qty' | 'new_qty'>) {
    const { data: product } = await supabase.from('products').select('stock_quantity').eq('id', movement.product_id).single();
    const previousQty = product?.stock_quantity || 0;
    const newQty = movement.type === 'IN' ? previousQty + movement.quantity : previousQty - movement.quantity;
    if (newQty < 0) throw new Error('Estoque insuficiente');
    await supabase.from('products').update({ stock_quantity: newQty }).eq('id', movement.product_id);
    const { data, error } = await supabase.from('stock_movements').insert({ ...movement, previous_qty: previousQty, new_qty: newQty }).select().single();
    if (error) throw error;
    return data as StockMovement;
  },
  async transfer(productId: string, fromLocationId: string, toLocationId: string, quantity: number, userId: string) {
    const { data: fromStock } = await supabase.from('location_stock').select('quantity').eq('product_id', productId).eq('location_id', fromLocationId).single();
    if (!fromStock || fromStock.quantity < quantity) throw new Error('Estoque insuficiente na origem');
    await supabase.from('location_stock').update({ quantity: fromStock.quantity - quantity }).eq('product_id', productId).eq('location_id', fromLocationId);
    const { data: toStock } = await supabase.from('location_stock').select('quantity').eq('product_id', productId).eq('location_id', toLocationId).single();
    if (toStock) { await supabase.from('location_stock').update({ quantity: toStock.quantity + quantity }).eq('product_id', productId).eq('location_id', toLocationId); }
    else { await supabase.from('location_stock').insert({ product_id: productId, location_id: toLocationId, quantity }); }
    return this.createMovement({ product_id: productId, type: 'TRANSFER', quantity, user_id: userId, reference: `${fromLocationId} -> ${toLocationId}` });
  }
};
