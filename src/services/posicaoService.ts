import { supabase } from '@/integrations/supabase/client';
export interface Posicao {
  id: string;
  codigo: string;
  tipo: string;
  zona?: string | null;
  porta_palete?: string | null;
  secao?: string | null;
  nivel?: string | null;
  box?: string | null;
  status: string;
  capacidade_kg?: number | null;
  created_at?: string;
  updated_at?: string;
}

export const posicaoService = {
  async getAll(): Promise<Posicao[]> {
    const { data, error } = await supabase
      .from('posicoes_estoque')
      .select('*')
      .order('codigo');
    if (error) {
      if (import.meta.env.DEV) console.error('Erro ao buscar posições:', error);
      return [];
    }
    return (data || []) as unknown as Posicao[];
  },

  async getById(id: string): Promise<Posicao | null> {
    const { data, error } = await supabase
      .from('posicoes_estoque')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      if (import.meta.env.DEV) console.error('Erro ao buscar posição:', error);
      return null;
    }
    return data as unknown as Posicao;
  },

  async getByCodigo(codigo: string): Promise<Posicao | null> {
    const { data, error } = await supabase
      .from('posicoes_estoque')
      .select('*')
      .eq('codigo', codigo)
      .single();
    if (error && error.code !== 'PGRST116') {
      if (import.meta.env.DEV) console.error('Erro ao buscar posição:', error);
      return null;
    }
    return data as unknown as Posicao | null;
  },

  async create(posicao: Omit<Posicao, 'id' | 'created_at' | 'updated_at'>): Promise<Posicao | null> {
    const { data, error } = await supabase
      .from('posicoes_estoque')
      .insert(posicao as any)
      .select()
      .single();
    if (error) {
      if (import.meta.env.DEV) console.error('Erro ao criar posição:', error);
      return null;
    }
    return data as unknown as Posicao;
  },

  async update(id: string, updates: Partial<Posicao>): Promise<boolean> {
    const { error } = await supabase
      .from('posicoes_estoque')
      .update({ ...updates, updated_at: new Date().toISOString() } as any)
      .eq('id', id);
    if (error) {
      if (import.meta.env.DEV) console.error('Erro ao atualizar posição:', error);
      return false;
    }
    return true;
  },

  async getDisponiveis(): Promise<Posicao[]> {
    const { data, error } = await supabase
      .from('posicoes_estoque')
      .select('*')
      .eq('status', 'livre')
      .order('codigo');
    if (error) {
      if (import.meta.env.DEV) console.error('Erro ao buscar posições disponíveis:', error);
      return [];
    }
    return (data || []) as unknown as Posicao[];
  },

  async ocupar(id: string, loteId: string, _produtoId?: string): Promise<boolean> {
   return this.update(id, { status: 'ocupado' });
  },

  async liberar(id: string): Promise<boolean> {
    return this.update(id, { status: 'livre' });
  },
};
