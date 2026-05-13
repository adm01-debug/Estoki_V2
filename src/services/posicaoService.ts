 import { supabase } from '@/lib/supabase';
 import { logger } from '@/utils/logger';
 import { Database } from '@/integrations/supabase/types';

 type PosicaoRow = Database['public']['Tables']['posicoes_estoque']['Row'];
 type PosicaoInsert = Database['public']['Tables']['posicoes_estoque']['Insert'];
 type PosicaoUpdate = Database['public']['Tables']['posicoes_estoque']['Update'];

export interface Posicao {
  id: string;
  codigo: string;
   tipo: Database['public']['Enums']['tipo_posicao'];
  zona?: string | null;
  porta_palete?: string | null;
  secao?: string | null;
  nivel?: string | null;
  box?: string | null;
   status: Database['public']['Enums']['status_posicao'];
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
       logger.error('Erro ao buscar posições', error);
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
       logger.error('Erro ao buscar posição por ID', error, { id });
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
       logger.error('Erro ao buscar posição por código', error, { codigo });
       return null;
     }
     return data as unknown as Posicao | null;
  },

  async create(posicao: Omit<Posicao, 'id' | 'created_at' | 'updated_at'>): Promise<Posicao | null> {
    const { data, error } = await supabase
      .from('posicoes_estoque')
       .insert(posicao as PosicaoInsert)
      .select()
      .single();
     if (error) {
       logger.error('Erro ao criar posição', error, { posicao });
       return null;
     }
     return data as unknown as Posicao;
  },

  async update(id: string, updates: Partial<Posicao>): Promise<boolean> {
    const { error } = await supabase
      .from('posicoes_estoque')
       .update({ ...updates, updated_at: new Date().toISOString() } as PosicaoUpdate)
      .eq('id', id);
     if (error) {
       logger.error('Erro ao atualizar posição', error, { id, updates });
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
       logger.error('Erro ao buscar posições disponíveis', error);
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
