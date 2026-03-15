// @ts-nocheck
import { supabase } from '@/lib/supabase';
export const supplierService = {
  async getAll() { const { data, error } = await supabase.from('suppliers').select('*'); if (error) throw error; return data; },
  async getById(id: string) { const { data, error } = await supabase.from('suppliers').select('*').eq('id', id).single(); if (error) throw error; return data; },
  async create(item: any) { const { data, error } = await supabase.from('suppliers').insert(item).select().single(); if (error) throw error; return data; },
  async update(id: string, updates: any) { const { data, error } = await supabase.from('suppliers').update(updates).eq('id', id).select().single(); if (error) throw error; return data; },
  async delete(id: string) { const { error } = await supabase.from('suppliers').delete().eq('id', id); if (error) throw error; }
};
