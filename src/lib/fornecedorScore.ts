export type ClassificacaoFornecedor = "A" | "B" | "C" | "D";

export type TendenciaFornecedor = "subindo" | "estavel" | "descendo" | "sem_dados";

/** Resultado de triagem que conta como entrega aprovada. */
export const RESULTADO_APROVADO = "aprovado";

/** Resultados de triagem que representam problema com o material recebido. */
export const RESULTADOS_COM_PROBLEMA = ["reprovado", "conserto"] as const;

export interface MetricasScoreFornecedor {
  totalEntregas: number;
  entregasConformes: number;
  desviosDias: number[];
}

export interface ScoreFornecedor {
  conformidade: number | null;
  leadTimeMedioDias: number | null;
  score: number | null;
}

const arredondar1 = (valor: number) => Math.round(valor * 10) / 10;

/**
 * Fonte única do score de fornecedor: conformidade (%) menos duas vezes o desvio
 * médio de prazo em dias, limitado a 0-100. Sem entregas não existe score.
 */
export function calcularScoreFornecedor({
  totalEntregas,
  entregasConformes,
  desviosDias,
}: MetricasScoreFornecedor): ScoreFornecedor {
  const base = Math.max(0, Math.floor(totalEntregas));
  if (base === 0) {
    return { conformidade: null, leadTimeMedioDias: null, score: null };
  }

  const conformes = Math.min(Math.max(0, Math.floor(entregasConformes)), base);
  const conformidade = arredondar1((conformes / base) * 100);
  const leadTimeMedioDias = desviosDias.length
    ? arredondar1(desviosDias.reduce((acc, dias) => acc + Math.abs(dias), 0) / desviosDias.length)
    : null;
  const score = arredondar1(
    Math.min(100, Math.max(0, conformidade - (leadTimeMedioDias ?? 0) * 2))
  );

  return { conformidade, leadTimeMedioDias, score };
}

export function classificacaoPorScore(score: number | null): ClassificacaoFornecedor | null {
  if (score === null) return null;
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  return "D";
}

export function estrelasPorScore(score: number | null): number | null {
  if (score === null) return null;
  if (score >= 95) return 5;
  if (score >= 85) return 4;
  if (score >= 70) return 3;
  if (score >= 50) return 2;
  return 1;
}

export function formatarPercentual(valor: number | null): string {
  return valor === null ? "—" : `${valor.toFixed(1)}%`;
}

/** Diferença em dias entre recebimento e previsão; positiva = atraso. */
export function diferencaEmDias(recebido?: string | null, previsto?: string | null): number | null {
  if (!recebido || !previsto) return null;
  const recebimento = new Date(`${recebido.slice(0, 10)}T00:00:00Z`).getTime();
  const previsao = new Date(`${previsto.slice(0, 10)}T00:00:00Z`).getTime();
  if (Number.isNaN(recebimento) || Number.isNaN(previsao)) return null;
  return (recebimento - previsao) / 86_400_000;
}

/** Tendência só existe quando as duas janelas têm entregas medidas. */
export function calcularTendencia(
  conformidadeRecente: number | null,
  conformidadeAnterior: number | null
): TendenciaFornecedor {
  if (conformidadeRecente === null || conformidadeAnterior === null) return "sem_dados";
  const delta = conformidadeRecente - conformidadeAnterior;
  if (delta >= 5) return "subindo";
  if (delta <= -5) return "descendo";
  return "estavel";
}
