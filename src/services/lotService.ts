import { supabase } from '@/integrations/supabase/client';
const from = (table: string) => (supabase.from as any)(table);
export const lotService = {
  async getAll() { const { data, error } = await from('lots').select('*'); if (error) throw error; return data; },
  async getById(id: string) { const { data, error } = await from('lots').select('*').eq('id', id).single(); if (error) throw error; return data; },
  async create(item: any) { const { data, error } = await from('lots').insert(item).select().single(); if (error) throw error; return data; },
  async update(id: string, updates: any) { const { data, error } = await from('lots').update(updates).eq('id', id).select().single(); if (error) throw error; return data; },
  async delete(id: string) { const { error } = await from('lots').delete().eq('id', id); if (error) throw error; }
};
