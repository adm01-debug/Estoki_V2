import { supabase } from '@/integrations/supabase/client';
import { Ciclo, TipoCiclo, StatusCiclo, Contagem, StatusContagem } from './types';

export const mapCiclo = (data: any): Ciclo => ({
  id: data.id,
  nome: data.nome,
  descricao: data.descricao || undefined,
  tipo: data.tipo as TipoCiclo,
  status: data.status as StatusCiclo,
  data_agendada: data.data_agendada,
  data_inicio: data.data_inicio || undefined,
  data_fim: data.data_fim || undefined,
  total_posicoes: data.total_posicoes || 0,
  posicoes_contadas: data.posicoes_contadas || 0,
  divergencias_encontradas: data.divergencias_encontradas || 0,
  acuracidade: data.acuracidade || undefined,
  zona_alvo: data.zona_alvo || undefined,
  porta_palete_alvo: data.porta_palete_alvo || undefined,
  responsavel_id: data.responsavel_id || undefined,
  responsavel_nome: data.profiles?.nome || undefined,
  observacoes: data.observacoes || undefined,
  created_at: data.created_at,
  updated_at: data.updated_at,
});

export const mapContagem = (c: any): Contagem => ({
  id: c.id,
  ciclo_id: c.ciclo_id,
  posicao_id: c.posicao_id,
  produto_id: c.produto_id || undefined,
  lote_id: c.lote_id || undefined,
  quantidade_sistema: c.quantidade_sistema,
  quantidade_contada: c.quantidade_contada || undefined,
  quantidade_recontada: c.quantidade_recontada || undefined,
  status: c.status as StatusContagem,
  recontagem_necessaria: c.recontagem_necessaria || false,
  contado_por: c.contado_por || undefined,
  recontado_por: c.recontado_por || undefined,
  ajustado_por: c.ajustado_por || undefined,
  data_contagem: c.data_contagem || undefined,
  data_recontagem: c.data_recontagem || undefined,
  data_ajuste: c.data_ajuste || undefined,
  justificativa_ajuste: c.justificativa_ajuste || undefined,
  observacoes: c.observacoes || undefined,
});

export const updateCicloProgress = async (cicloId: string): Promise<void> => {
  try {
    const { data: contagens } = await supabase
      .from('inventario_contagens')
      .select('*')
      .eq('ciclo_id', cicloId);

    if (!contagens) return;

    const total = contagens.length;
    const contados = contagens.filter(c => c.status !== 'pendente').length;
    const divergentes = contagens.filter(c => c.recontagem_necessaria).length;
    const acuracidade = contados > 0 ? ((contados - divergentes) / contados) * 100 : 0;

    await supabase
      .from('inventario_ciclos')
      .update({
        total_posicoes: total,
        posicoes_contadas: contados,
        divergencias_encontradas: divergentes,
        acuracidade: Math.round(acuracidade * 100) / 100,
      })
      .eq('id', cicloId);
  } catch (err) {
    if (import.meta.env.DEV) console.error('Erro ao atualizar progresso:', err);
  }
};
