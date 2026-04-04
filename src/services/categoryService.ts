import { supabase } from '@/integrations/supabase/client';
export const categoryService = {
  async getAll() { const { data, error } = await (supabase.from as any)('categorys').select('*'); if (error) throw error; return data; },
  async getById(id: string) { const { data, error } = await (supabase.from as any)('categorys').select('*').eq('id', id).single(); if (error) throw error; return data; },
  async create(item: any) { const { data, error } = await (supabase.from as any)('categorys').insert(item).select().single(); if (error) throw error; return data; },
  async update(id: string, updates: any) { const { data, error } = await (supabase.from as any)('categorys').update(updates).eq('id', id).select().single(); if (error) throw error; return data; },
  async delete(id: string) { const { error } = await (supabase.from as any)('categorys').delete().eq('id', id); if (error) throw error; }
};
