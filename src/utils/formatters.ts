/**
 * Utilitários de formatação para o sistema ESTOKI
 */

import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ============================================
// FORMATAÇÃO DE DATAS
// ============================================

/**
 * Formata data para exibição padrão (dd/MM/yyyy)
 */
export function formatarData(data: string | Date | null | undefined): string {
  if (!data) return '-';
  const date = typeof data === 'string' ? parseISO(data) : data;
  if (!isValid(date)) return '-';
  return format(date, 'dd/MM/yyyy', { locale: ptBR });
}

/**
 * Formata data e hora (dd/MM/yyyy HH:mm)
 */
export function formatarDataHora(data: string | Date | null | undefined): string {
  if (!data) return '-';
  const date = typeof data === 'string' ? parseISO(data) : data;
  if (!isValid(date)) return '-';
  return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
}

/**
 * Formata data curta (dd/MM)
 */
export function formatarDataCurta(data: string | Date | null | undefined): string {
  if (!data) return '-';
  const date = typeof data === 'string' ? parseISO(data) : data;
  if (!isValid(date)) return '-';
  return format(date, 'dd/MM', { locale: ptBR });
}

/**
 * Formata hora (HH:mm)
 */
export function formatarHora(data: string | Date | null | undefined): string {
  if (!data) return '-';
  const date = typeof data === 'string' ? parseISO(data) : data;
  if (!isValid(date)) return '-';
  return format(date, 'HH:mm', { locale: ptBR });
}

/**
 * Formata tempo relativo (há 5 minutos, há 2 dias, etc)
 */
export function formatarTempoRelativo(data: string | Date | null | undefined): string {
  if (!data) return '-';
  const date = typeof data === 'string' ? parseISO(data) : data;
  if (!isValid(date)) return '-';
  return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
}

/**
 * Formata dia da semana
 */
export function formatarDiaSemana(data: string | Date | null | undefined): string {
  if (!data) return '-';
  const date = typeof data === 'string' ? parseISO(data) : data;
  if (!isValid(date)) return '-';
  return format(date, 'EEEE', { locale: ptBR });
}

// ============================================
// FORMATAÇÃO DE NÚMEROS
// ============================================

/**
 * Formata número com separadores de milhar
 */
export function formatarNumero(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return '-';
  return new Intl.NumberFormat('pt-BR').format(valor);
}

/**
 * Formata percentual (75.5 -> "75,5%")
 */
export function formatarPercentual(valor: number | null | undefined, decimais: number = 1): string {
  if (valor === null || valor === undefined) return '-';
  return `${valor.toFixed(decimais).replace('.', ',')}%`;
}

/**
 * Formata valor monetário
 */
export function formatarMoeda(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return '-';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

/**
 * Formata número compacto (1000 -> "1K", 1000000 -> "1M")
 */
export function formatarNumeroCompacto(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return '-';
  if (valor >= 1000000) {
    return `${(valor / 1000000).toFixed(1).replace('.', ',')}M`;
  }
  if (valor >= 1000) {
    return `${(valor / 1000).toFixed(1).replace('.', ',')}K`;
  }
  return formatarNumero(valor);
}

/**
 * Formata quantidade com unidade
 */
export function formatarQuantidade(valor: number | null | undefined, unidade: string = 'un'): string {
  if (valor === null || valor === undefined) return '-';
  return `${formatarNumero(valor)} ${unidade}`;
}

// ============================================
// FORMATAÇÃO DE TEMPO/DURAÇÃO
// ============================================

/**
 * Formata minutos para exibição (90 -> "1h 30min")
 */
export function formatarMinutos(minutos: number | null | undefined): string {
  if (minutos === null || minutos === undefined) return '-';
  
  if (minutos < 1) {
    return '< 1min';
  }
  
  if (minutos < 60) {
    return `${Math.round(minutos)}min`;
  }
  
  const horas = Math.floor(minutos / 60);
  const mins = Math.round(minutos % 60);
  
  if (mins === 0) {
    return `${horas}h`;
  }
  
  return `${horas}h ${mins}min`;
}

/**
 * Formata segundos para exibição (90 -> "1:30")
 */
export function formatarSegundos(segundos: number | null | undefined): string {
  if (segundos === null || segundos === undefined) return '-';
  
  const mins = Math.floor(segundos / 60);
  const secs = Math.floor(segundos % 60);
  
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formata duração longa (para dias)
 */
export function formatarDuracao(minutos: number | null | undefined): string {
  if (minutos === null || minutos === undefined) return '-';
  
  if (minutos < 60) {
    return `${Math.round(minutos)} min`;
  }
  
  if (minutos < 1440) { // menos de 1 dia
    const horas = Math.floor(minutos / 60);
    const mins = Math.round(minutos % 60);
    return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;
  }
  
  const dias = Math.floor(minutos / 1440);
  const horasRestantes = Math.floor((minutos % 1440) / 60);
  return horasRestantes > 0 ? `${dias}d ${horasRestantes}h` : `${dias}d`;
}

// ============================================
// FORMATAÇÃO DE TEXTO
// ============================================

/**
 * Trunca texto com reticências
 */
export function truncarTexto(texto: string | null | undefined, maxLength: number = 50): string {
  if (!texto) return '-';
  if (texto.length <= maxLength) return texto;
  return `${texto.substring(0, maxLength)}...`;
}

/**
 * Capitaliza primeira letra
 */
export function capitalizar(texto: string | null | undefined): string {
  if (!texto) return '';
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

/**
 * Formata nome próprio (cada palavra com inicial maiúscula)
 */
export function formatarNome(texto: string | null | undefined): string {
  if (!texto) return '';
  return texto
    .toLowerCase()
    .split(' ')
    .map(palavra => {
      // Não capitaliza preposições e artigos
      if (['de', 'da', 'do', 'das', 'dos', 'e'].includes(palavra)) {
        return palavra;
      }
      return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    })
    .join(' ');
}

/**
 * Formata código de lote (adiciona zeros à esquerda)
 */
export function formatarCodigoLote(codigo: string | number | null | undefined, tamanho: number = 6): string {
  if (codigo === null || codigo === undefined) return '-';
  return String(codigo).padStart(tamanho, '0');
}

/**
 * Formata CPF
 */
export function formatarCPF(cpf: string | null | undefined): string {
  if (!cpf) return '-';
  const numeros = cpf.replace(/\D/g, '');
  if (numeros.length !== 11) return cpf;
  return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata CNPJ
 */
export function formatarCNPJ(cnpj: string | null | undefined): string {
  if (!cnpj) return '-';
  const numeros = cnpj.replace(/\D/g, '');
  if (numeros.length !== 14) return cnpj;
  return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

/**
 * Formata telefone
 */
export function formatarTelefone(telefone: string | null | undefined): string {
  if (!telefone) return '-';
  const numeros = telefone.replace(/\D/g, '');
  if (numeros.length === 11) {
    return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (numeros.length === 10) {
    return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return telefone;
}

// ============================================
// FORMATAÇÃO DE STATUS
// ============================================

/**
 * Formata status para exibição
 */
export function formatarStatus(status: string | null | undefined): string {
  if (!status) return '-';
  
  const statusMap: Record<string, string> = {
    'pendente': 'Pendente',
    'em_andamento': 'Em Andamento',
    'em_progresso': 'Em Progresso',
    'concluido': 'Concluído',
    'concluída': 'Concluída',
    'cancelado': 'Cancelado',
    'aprovado': 'Aprovado',
    'reprovado': 'Reprovado',
    'aprovado_parcial': 'Aprovado Parcial',
    'aguardando': 'Aguardando',
    'ativo': 'Ativo',
    'inativo': 'Inativo',
    'pausado': 'Pausado',
  };
  
  return statusMap[status.toLowerCase()] || capitalizar(status.replace(/_/g, ' '));
}

/**
 * Retorna cor do status para badges
 */
export function getCorStatus(status: string | null | undefined): string {
  if (!status) return 'default';
  
  const coresMap: Record<string, string> = {
    'pendente': 'warning',
    'em_andamento': 'info',
    'em_progresso': 'info',
    'concluido': 'success',
    'concluída': 'success',
    'aprovado': 'success',
    'reprovado': 'destructive',
    'cancelado': 'secondary',
    'ativo': 'success',
    'inativo': 'secondary',
    'pausado': 'warning',
  };
  
  return coresMap[status.toLowerCase()] || 'default';
}

// ============================================
// HELPERS
// ============================================

/**
 * Verifica se valor é vazio/nulo
 */
export function isVazio(valor: unknown): boolean {
  if (valor === null || valor === undefined) return true;
  if (typeof valor === 'string' && valor.trim() === '') return true;
  if (Array.isArray(valor) && valor.length === 0) return true;
  return false;
}

/**
 * Retorna valor ou fallback se vazio
 */
export function valorOuFallback<T>(valor: T | null | undefined, fallback: T): T {
  return isVazio(valor) ? fallback : valor!;
}

/**
 * Formata variação percentual com seta
 */
export function formatarVariacao(valor: number | null | undefined): { texto: string; tipo: 'up' | 'down' | 'stable' } {
  if (valor === null || valor === undefined || Math.abs(valor) < 0.1) {
    return { texto: '0%', tipo: 'stable' };
  }
  
  const texto = `${valor > 0 ? '+' : ''}${valor.toFixed(1).replace('.', ',')}%`;
  const tipo = valor > 0 ? 'up' : 'down';
  
  return { texto, tipo };
}
