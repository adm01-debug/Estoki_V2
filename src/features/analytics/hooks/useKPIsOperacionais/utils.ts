import { MetricaOperacional, KPIConsolidado, EvolucaoDiaria } from "./types";
import { format, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

export const calcularKPIsConsolidados = (metricas: MetricaOperacional[]): KPIConsolidado => {
  if (metricas.length === 0) {
    return {
      totalItensTriados: 0,
      tempoMedioTriagem: 0,
      taxaAprovacao: 0,
      itensAprovados: 0,
      itensReprovados: 0,
      pedidosSeparados: 0,
      itensSeparados: 0,
      errosPicking: 0,
      acuracidadePicking: 0,
      taxaOcupacao: 0,
      posicoesTotais: 0,
      posicoesOcupadas: 0,
      volumesRecebidos: 0,
      nfsProcessadas: 0,
      tempoMedioRecebimento: 0,
      movimentacoesRealizadas: 0,
    };
  }

  const soma = metricas.reduce((acc, m) => ({
    itensTriados: acc.itensTriados + (m.itens_triados || 0),
    itensAprovados: acc.itensAprovados + (m.itens_aprovados || 0),
    itensReprovados: acc.itensReprovados + (m.itens_reprovados || 0),
    pedidosSeparados: acc.pedidosSeparados + (m.pedidos_separados || 0),
    itensSeparados: acc.itensSeparados + (m.itens_separados || 0),
    errosPicking: acc.errosPicking + (m.erros_picking || 0),
    volumesRecebidos: acc.volumesRecebidos + (m.volumes_recebidos || 0),
    nfsProcessadas: acc.nfsProcessadas + (m.nfs_processadas || 0),
    movimentacoes: acc.movimentacoes + (m.movimentacoes_realizadas || 0),
    tempoTriagem: acc.tempoTriagem + (m.tempo_medio_triagem_minutos || 0),
    tempoRecebimento: acc.tempoRecebimento + (m.tempo_medio_recebimento_minutos || 0),
    acuracidadePicking: acc.acuracidadePicking + (m.acuracidade_picking || 0),
    countMetricas: acc.countMetricas + 1,
  }), {
    itensTriados: 0,
    itensAprovados: 0,
    itensReprovados: 0,
    pedidosSeparados: 0,
    itensSeparados: 0,
    errosPicking: 0,
    volumesRecebidos: 0,
    nfsProcessadas: 0,
    movimentacoes: 0,
    tempoTriagem: 0,
    tempoRecebimento: 0,
    acuracidadePicking: 0,
    countMetricas: 0,
  });

  const ultimaMetrica = metricas[0];

  return {
    totalItensTriados: soma.itensTriados,
    tempoMedioTriagem: soma.countMetricas > 0 ? soma.tempoTriagem / soma.countMetricas : 0,
    taxaAprovacao: soma.itensTriados > 0 
      ? (soma.itensAprovados / soma.itensTriados) * 100 
      : 0,
    itensAprovados: soma.itensAprovados,
    itensReprovados: soma.itensReprovados,
    pedidosSeparados: soma.pedidosSeparados,
    itensSeparados: soma.itensSeparados,
    errosPicking: soma.errosPicking,
    acuracidadePicking: soma.countMetricas > 0 ? soma.acuracidadePicking / soma.countMetricas : 0,
    taxaOcupacao: ultimaMetrica?.taxa_ocupacao || 0,
    posicoesTotais: ultimaMetrica?.posicoes_totais || 0,
    posicoesOcupadas: ultimaMetrica?.posicoes_ocupadas || 0,
    volumesRecebidos: soma.volumesRecebidos,
    nfsProcessadas: soma.nfsProcessadas,
    tempoMedioRecebimento: soma.countMetricas > 0 ? soma.tempoRecebimento / soma.countMetricas : 0,
    movimentacoesRealizadas: soma.movimentacoes,
  };
};

export const formatarEvolucaoDiaria = (metricas: MetricaOperacional[]): EvolucaoDiaria[] => {
  return metricas
    .slice(0, 30)
    .reverse()
    .map(m => ({
      data: m.data,
      dataFormatada: format(new Date(m.data), "dd/MM", { locale: ptBR }),
      itensTriados: m.itens_triados || 0,
      pedidosSeparados: m.pedidos_separados || 0,
      taxaAprovacao: m.taxa_aprovacao || 0,
      acuracidadePicking: m.acuracidade_picking || 0,
    }));
};

export const formatarEvolucaoSemanal = (metricas: MetricaOperacional[]): { semana: string; media: number }[] => {
  const semanas = new Map<string, number[]>();
  
  metricas.forEach(m => {
    const data = new Date(m.data);
    const inicioSemana = startOfWeek(data, { locale: ptBR });
    const chave = format(inicioSemana, "dd/MM", { locale: ptBR });
    
    if (!semanas.has(chave)) {
      semanas.set(chave, []);
    }
    semanas.get(chave)!.push(m.itens_triados || 0);
  });

  return Array.from(semanas.entries()).map(([semana, valores]) => ({
    semana,
    media: valores.reduce((a, b) => a + b, 0) / valores.length,
  }));
};
