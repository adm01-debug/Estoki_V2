 import { supabase } from '@/lib/supabase';
 import { logger } from '@/utils/logger';
 import { Database } from '@/integrations/supabase/types';

export interface Estoque {
   id: string;
   codigo: string;
   zona: string | null;
   porta_palete: string | null;
   secao: string | null;
   nivel: string | null;
   box: string | null;
   tipo: Database['public']['Enums']['tipo_posicao'];
   status: Database['public']['Enums']['status_posicao'];
   capacidade_kg: number | null;
   created_at: string;
   updated_at: string;
 }

 type PosicaoInsert = Database['public']['Tables']['posicoes_estoque']['Insert'];
 type PosicaoUpdate = Database['public']['Tables']['posicoes_estoque']['Update'];

export const estoqueService = {
  async getAll(): Promise<Estoque[]> {
     try {
       const { data, error } = await supabase
         .from('posicoes_estoque')
         .select('*')
         .order('created_at', { ascending: false });
       if (error) throw error;
       return (data || []) as unknown as Estoque[];
     } catch (error) {
       logger.error("Erro ao buscar todas as posições de estoque", error);
       throw error;
     }
  },

  async getById(id: string): Promise<Estoque | null> {
     try {
       const { data, error } = await supabase.from('posicoes_estoque').select('*').eq('id', id).single();
       if (error) throw error;
       return data as unknown as Estoque;
     } catch (error) {
       logger.error("Erro ao buscar posição de estoque por ID", error, { id });
       throw error;
     }
   },

  async create(estoque: Omit<Estoque, 'id' | 'created_at' | 'updated_at'>): Promise<Estoque> {
     try {
       const { data, error } = await supabase
         .from('posicoes_estoque')
         .insert(estoque as PosicaoInsert)
         .select()
         .single();
       if (error) throw error;
       logger.info("Posição de estoque criada", { id: data.id });
       return data as unknown as Estoque;
     } catch (error) {
       logger.error("Erro ao criar posição de estoque", error, { estoque });
       throw error;
     }
   },

  async update(id: string, updates: Partial<Estoque>): Promise<Estoque> {
     try {
       const { data, error } = await supabase.from('posicoes_estoque')
         .update({ ...updates, updated_at: new Date().toISOString() } as PosicaoUpdate)
         .eq('id', id).select().single();
       if (error) throw error;
       logger.info("Posição de estoque atualizada", { id });
       return data as unknown as Estoque;
     } catch (error) {
       logger.error("Erro ao atualizar posição de estoque", error, { id, updates });
       throw error;
     }
   },

  async delete(id: string): Promise<void> {
     try {
       const { error } = await supabase.from('posicoes_estoque').delete().eq('id', id);
       if (error) throw error;
       logger.info("Posição de estoque deletada", { id });
     } catch (error) {
       logger.error("Erro ao deletar posição de estoque", error, { id });
       throw error;
     }
   },

  async getByPosicao(posicaoId: string): Promise<Estoque[]> {
     try {
       const { data, error } = await supabase.from('posicoes_estoque').select('*').eq('id', posicaoId);
       if (error) throw error;
       return (data || []) as unknown as Estoque[];
     } catch (error) {
       logger.error("Erro ao buscar posição de estoque", error, { posicaoId });
       throw error;
     }
   },

  async getByProduto(produtoId: string): Promise<Estoque[]> {
     try {
       const { data, error } = await supabase.from('estoque_posicao').select('*').eq('produto_id', produtoId);
       if (error) throw error;
       return (data || []) as unknown as Estoque[];
     } catch (error) {
       logger.error("Erro ao buscar estoque por produto", error, { produtoId });
       throw error;
     }
  }
};
