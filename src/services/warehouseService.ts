import { supabase } from '@/integrations/supabase/client';
const from = (table: string) => (supabase.from as any)(table);
export const warehouseService = {
  async getAll() { const { data, error } = await from('warehouses').select('*'); if (error) throw error; return data; },
  async getById(id: string) { const { data, error } = await from('warehouses').select('*').eq('id', id).single(); if (error) throw error; return data; },
  async create(item: Record<string, unknown>) { const { data, error } = await from('warehouses').insert(item).select().single(); if (error) throw error; return data; },
  async update(id: string, updates: Record<string, unknown>) { const { data, error } = await from('warehouses').update(updates).eq('id', id).select().single(); if (error) throw error; return data; },
  async delete(id: string) { const { error } = await from('warehouses').delete().eq('id', id); if (error) throw error; }
};
