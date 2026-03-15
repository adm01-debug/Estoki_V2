// @ts-nocheck
import { supabase } from '@/lib/supabase';
export const warehouseService = {
  async getAll() { const { data, error } = await supabase.from('warehouses').select('*'); if (error) throw error; return data; },
  async getById(id: string) { const { data, error } = await supabase.from('warehouses').select('*').eq('id', id).single(); if (error) throw error; return data; },
  async create(item: any) { const { data, error } = await supabase.from('warehouses').insert(item).select().single(); if (error) throw error; return data; },
  async update(id: string, updates: any) { const { data, error } = await supabase.from('warehouses').update(updates).eq('id', id).select().single(); if (error) throw error; return data; },
  async delete(id: string) { const { error } = await supabase.from('warehouses').delete().eq('id', id); if (error) throw error; }
};
