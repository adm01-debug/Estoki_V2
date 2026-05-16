import type { Database } from '@/integrations/supabase/types';

export type LoteRow = Database['public']['Tables']['lotes']['Row'];
export type LoteInsert = Database['public']['Tables']['lotes']['Insert'];
export type LoteUpdate = Database['public']['Tables']['lotes']['Update'];

export type StatusRecebimento = 'aguardando' | 'em_transito' | 'recebido' | 'em_conferencia' | 'conferido' | 'divergencia' | 'cancelado';

export interface RecebimentoItem extends LoteRow {
  produto?: {
    nome: string;
    sku: string;
  };
}

export interface RecebimentoStats {
  todos: number;
  aguardando: number;
  em_transito: number;
  recebido: number;
  em_conferencia: number;
  conferido: number;
  divergencia: number;
}

export type TipoEmbalagem = "original" | "pallet" | "caixa" | "unidade";
