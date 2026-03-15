// @ts-nocheck
import { supabase } from '@/lib/supabase';
export const customerService = {
  async getAll() { const { data, error } = await supabase.from('customers').select('*'); if (error) throw error; return data; },
  async getById(id: string) { const { data, error } = await supabase.from('customers').select('*').eq('id', id).single(); if (error) throw error; return data; },
  async create(item: any) { const { data, error } = await supabase.from('customers').insert(item).select().single(); if (error) throw error; return data; },
  async update(id: string, updates: any) { const { data, error } = await supabase.from('customers').update(updates).eq('id', id).select().single(); if (error) throw error; return data; },
  async delete(id: string) { const { error } = await supabase.from('customers').delete().eq('id', id); if (error) throw error; }
};
