// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';

export interface Estoque {
  id: string;
  produto_id: string;
  posicao_id: string;
  quantidade: number;
  lote?: string;
  validade?: string;
  created_at?: string;
  updated_at?: string;
}

export const estoqueService = {
  async getAll(): Promise<Estoque[]> {
    const { data, error } = await supabase
      .from('posicoes_estoque')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Estoque | null> {
    const { data, error } = await supabase
      .from('posicoes_estoque')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(estoque: Omit<Estoque, 'id' | 'created_at' | 'updated_at'>): Promise<Estoque> {
    const { data, error } = await supabase
      .from('posicoes_estoque')
      .insert(estoque)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Estoque>): Promise<Estoque> {
    const { data, error } = await supabase
      .from('posicoes_estoque')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('posicoes_estoque')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async getByPosicao(posicaoId: string): Promise<Estoque[]> {
    const { data, error } = await supabase
      .from('posicoes_estoque')
      .select('*')
      .eq('posicao_id', posicaoId);
    if (error) throw error;
    return data || [];
  },

  async getByProduto(produtoId: string): Promise<Estoque[]> {
    const { data, error } = await supabase
      .from('posicoes_estoque')
      .select('*')
      .eq('produto_id', produtoId);
    if (error) throw error;
    return data || [];
  }
};
