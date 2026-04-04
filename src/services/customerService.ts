import { supabase } from '@/integrations/supabase/client';
export const customerService = {
  async getAll() { const { data, error } = await (supabase.from as any)('customers').select('*').order('created_at', { ascending: false }).limit(500); if (error) throw error; return data; },
  async getById(id: string) { const { data, error } = await (supabase.from as any)('customers').select('*').eq('id', id).single(); if (error) throw error; return data; },
  async create(item: Record<string, unknown>) { const { data, error } = await (supabase.from as any)('customers').insert(item).select().single(); if (error) throw error; return data; },
  async update(id: string, updates: Record<string, unknown>) { const { data, error } = await (supabase.from as any)('customers').update(updates).eq('id', id).select().single(); if (error) throw error; return data; },
  async delete(id: string) { const { error } = await (supabase.from as any)('customers').delete().eq('id', id); if (error) throw error; }
};
