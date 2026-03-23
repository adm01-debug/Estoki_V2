// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';
export const putawayService = {
  async getAll(filters?: any) { const { data, error } = await supabase.from('items').select('*'); if (error) throw error; return data; },
  async getById(id: string) { const { data, error } = await supabase.from('items').select('*').eq('id', id).single(); if (error) throw error; return data; },
  async create(item: any) { const { data, error } = await supabase.from('items').insert(item).select().single(); if (error) throw error; return data; },
  async update(id: string, updates: any) { const { data, error } = await supabase.from('items').update(updates).eq('id', id).select().single(); if (error) throw error; return data; },
  async delete(id: string) { const { error } = await supabase.from('items').delete().eq('id', id); if (error) throw error; }
};
