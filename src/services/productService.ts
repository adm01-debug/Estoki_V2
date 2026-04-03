import { supabase } from '@/integrations/supabase/client';
export interface Product { id: string; name: string; sku: string; barcode?: string; description?: string; category_id?: string; cost: number; price: number; stock_quantity: number; reserved_quantity: number; reorder_point: number; reorder_quantity: number; unit: string; weight?: number; dimensions?: { width: number; height: number; length: number }; image_url?: string; status: 'active' | 'inactive' | 'discontinued'; created_at: string; updated_at: string; }
export const productService = {
  async getAll(filters?: { category?: string; status?: string; search?: string }) {
    let query = supabase.from('products').select('*, categories(name)');
    if (filters?.category) query = query.eq('category_id', filters.category);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.search) query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
    const { data, error } = await query.order('name');
    if (error) throw error;
    return data as Product[];
  },
  async getById(id: string) { const { data, error } = await supabase.from('products').select('*, categories(name), suppliers(name)').eq('id', id).single(); if (error) throw error; return data as Product; },
  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) { const { data, error } = await supabase.from('products').insert(product).select().single(); if (error) throw error; return data as Product; },
  async update(id: string, updates: Partial<Product>) { const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single(); if (error) throw error; return data as Product; },
  async delete(id: string) { const { error } = await supabase.from('products').delete().eq('id', id); if (error) throw error; },
  async updateStock(id: string, quantity: number, type: 'add' | 'subtract') { const { data: product } = await supabase.from('products').select('stock_quantity').eq('id', id).single(); const newQty = type === 'add' ? product.stock_quantity + quantity : product.stock_quantity - quantity; return this.update(id, { stock_quantity: newQty }); },
  async getLowStock() { const { data, error } = await supabase.from('products').select('*').filter('stock_quantity', 'lte', supabase.rpc('get_reorder_point')); if (error) throw error; return data as Product[]; }
};
