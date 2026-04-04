import { supabase } from '@/integrations/supabase/client';

export interface Estoque {
  id: string;
  codigo: string;
  zona?: string | null;
  porta_palete?: string | null;
  secao?: string | null;
  nivel?: string | null;
  box?: string | null;
  tipo: string;
  status: string;
  capacidade_kg?: number | null;
  created_at?: string;
  updated_at?: string;
}

const db = supabase.from('posicoes_estoque');

export const estoqueService = {
  async getAll(): Promise<Estoque[]> {
    const { data, error } = await db.select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as unknown as Estoque[];
  },

  async getById(id: string): Promise<Estoque | null> {
    const { data, error } = await supabase.from('posicoes_estoque').select('*').eq('id', id).single();
    if (error) throw error;
    return data as unknown as Estoque;
  },

  async create(estoque: Omit<Estoque, 'id' | 'created_at' | 'updated_at'>): Promise<Estoque> {
    const { data, error } = await supabase.from('posicoes_estoque').insert(estoque as any).select().single();
    if (error) throw error;
    return data as unknown as Estoque;
  },

  async update(id: string, updates: Partial<Estoque>): Promise<Estoque> {
    const { data, error } = await supabase.from('posicoes_estoque')
      .update({ ...updates, updated_at: new Date().toISOString() } as any)
      .eq('id', id).select().single();
    if (error) throw error;
    return data as unknown as Estoque;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('posicoes_estoque').delete().eq('id', id);
    if (error) throw error;
  },

  async getByPosicao(posicaoId: string): Promise<Estoque[]> {
    const { data, error } = await supabase.from('posicoes_estoque').select('*').eq('id', posicaoId);
    if (error) throw error;
    return (data || []) as unknown as Estoque[];
  },

  async getByProduto(produtoId: string): Promise<Estoque[]> {
    const { data, error } = await (supabase.from as any)('estoque_posicao').select('*').eq('produto_id', produtoId);
    if (error) throw error;
    return (data || []) as unknown as Estoque[];
  }
};
