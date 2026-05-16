import type { Database } from '@/integrations/supabase/types';

export type TriagemRow = Database['public']['Tables']['eventos_triagem']['Row'];
export type TriagemInsert = Database['public']['Tables']['eventos_triagem']['Insert'];
export type TriagemUpdate = Database['public']['Tables']['eventos_triagem']['Update'];

export type StatusTriagem = 'em_andamento' | 'aprovado' | 'reprovado' | 'ressalva' | 'pendente';

export interface TriagemStats {
  emAndamento: number;
  aprovados: number;
  reprovados: number;
}

export interface FotoTriagem {
  id?: string;
  url: string;
  tipo: 'geral' | 'defeito' | 'etiqueta' | 'outro';
  observacao?: string;
}