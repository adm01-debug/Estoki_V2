import { supabase } from '@/integrations/supabase/client';
export interface Posicao {
  id: string;
  codigo: string;
  tipo: string;
  corredor?: string;
  prateleira?: string;
  nivel?: string;
  status: 'disponivel' | 'ocupada' | 'reservada' | 'bloqueada';
  capacidade_max?: number;
  ocupacao_atual?: number;
  produto_id?: string;
  lote_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const posicaoService = {
  // Buscar todas as posições
  async getAll(): Promise<Posicao[]> {
    const { data, error } = await supabase
      .from('posicoes_estoque')
      .select('*')
      .order('codigo');

    if (error) {
      console.error('Erro ao buscar posições:', error);
      return [];
    }

    return data || [];
  },

  // Buscar posição por ID
  async getById(id: string): Promise<Posicao | null> {
    const { data, error } = await supabase
      .from('posicoes_estoque')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar posição:', error);
      return null;
    }

    return data;
  },

  // Buscar posição por código
  async getByCodigo(codigo: string): Promise<Posicao | null> {
    const { data, error } = await supabase
      .from('posicoes_estoque')
      .select('*')
      .eq('codigo', codigo)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar posição:', error);
      return null;
    }

    return data;
  },

  // Criar nova posição
  async create(posicao: Omit<Posicao, 'id' | 'created_at' | 'updated_at'>): Promise<Posicao | null> {
    const { data, error } = await supabase
      .from('posicoes_estoque')
      .insert(posicao)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar posição:', error);
      return null;
    }

    return data;
  },

  // Atualizar posição
  async update(id: string, updates: Partial<Posicao>): Promise<boolean> {
    const { error } = await supabase
      .from('posicoes_estoque')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar posição:', error);
      return false;
    }

    return true;
  },

  // Buscar posições disponíveis
  async getDisponiveis(): Promise<Posicao[]> {
    const { data, error } = await supabase
      .from('posicoes_estoque')
      .select('*')
      .eq('status', 'disponivel')
      .order('codigo');

    if (error) {
      console.error('Erro ao buscar posições disponíveis:', error);
      return [];
    }

    return data || [];
  },

  // Ocupar posição
  async ocupar(id: string, loteId: string, produtoId?: string): Promise<boolean> {
    return this.update(id, {
      status: 'ocupada',
      lote_id: loteId,
      produto_id: produtoId,
    });
  },

  // Liberar posição
  async liberar(id: string): Promise<boolean> {
    return this.update(id, {
      status: 'disponivel',
      lote_id: undefined,
      produto_id: undefined,
      ocupacao_atual: 0,
    });
  },
};
