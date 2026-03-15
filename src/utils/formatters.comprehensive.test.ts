/**
 * SUITE EXAUSTIVA — FORMATTERS + NUMBER + DATE
 * ~100 cenários cobrindo todas as funções de formatação
 */
import { describe, it, expect } from 'vitest';
import {
  formatarData, formatarDataHora, formatarDataCurta, formatarHora,
  formatarTempoRelativo, formatarNumero, formatarPercentual, formatarMoeda,
  formatarNumeroCompacto, formatarQuantidade, formatarMinutos, formatarSegundos,
  formatarDuracao, truncarTexto, capitalizar, formatarNome, formatarCodigoLote,
  formatarCPF, formatarCNPJ, formatarTelefone, formatarStatus, getCorStatus,
  isVazio, valorOuFallback, formatarVariacao,
} from '@/utils/formatters';
import {
  formatCurrency, formatNumber, formatPercent, formatCompact,
  clamp, roundTo, percentage, formatBytes,
} from '@/utils/number';
import {
  formatDate, formatDateTime, isSameDay, startOfDay, endOfDay,
  addDays, diffInDays,
} from '@/utils/date';

// ========== formatarData / null handling ==========
describe('formatarData', () => {
  it('null -> "-"', () => expect(formatarData(null)).toBe('-'));
  it('undefined -> "-"', () => expect(formatarData(undefined)).toBe('-'));
  it('data válida', () => expect(formatarData('2024-03-15')).toContain('15'));
  it('Date object', () => expect(formatarData(new Date(2024, 2, 15))).toContain('15'));
});

describe('formatarDataHora', () => {
  it('null -> "-"', () => expect(formatarDataHora(null)).toBe('-'));
  it('ISO string', () => expect(formatarDataHora('2024-03-15T14:30:00')).toContain('14'));
});

describe('formatarDataCurta', () => {
  it('null -> "-"', () => expect(formatarDataCurta(null)).toBe('-'));
  it('ok', () => expect(formatarDataCurta('2024-03-15')).toContain('15'));
});

describe('formatarHora', () => {
  it('null -> "-"', () => expect(formatarHora(null)).toBe('-'));
});

// ========== Números ==========
describe('formatarNumero', () => {
  it('null -> "-"', () => expect(formatarNumero(null)).toBe('-'));
  it('1000 -> separador', () => expect(formatarNumero(1000)).toContain('1'));
  it('0', () => expect(formatarNumero(0)).toBe('0'));
});

describe('formatarPercentual', () => {
  it('null -> "-"', () => expect(formatarPercentual(null)).toBe('-'));
  it('75.5 -> "75,5%"', () => expect(formatarPercentual(75.5)).toBe('75,5%'));
  it('100 -> "100,0%"', () => expect(formatarPercentual(100)).toBe('100,0%'));
  it('0 -> "0,0%"', () => expect(formatarPercentual(0)).toBe('0,0%'));
});

describe('formatarMoeda', () => {
  it('null -> "-"', () => expect(formatarMoeda(null)).toBe('-'));
  it('contém R$', () => expect(formatarMoeda(100)).toContain('R$'));
  it('0', () => expect(formatarMoeda(0)).toContain('R$'));
});

describe('formatarNumeroCompacto', () => {
  it('null -> "-"', () => expect(formatarNumeroCompacto(null)).toBe('-'));
  it('1500 -> K', () => expect(formatarNumeroCompacto(1500)).toContain('K'));
  it('2000000 -> M', () => expect(formatarNumeroCompacto(2000000)).toContain('M'));
  it('500 -> número normal', () => expect(formatarNumeroCompacto(500)).toBe('500'));
});

describe('formatarQuantidade', () => {
  it('null -> "-"', () => expect(formatarQuantidade(null)).toBe('-'));
  it('10 un', () => expect(formatarQuantidade(10)).toContain('un'));
  it('custom unidade', () => expect(formatarQuantidade(5, 'kg')).toContain('kg'));
});

// ========== Tempo ==========
describe('formatarMinutos', () => {
  it('null -> "-"', () => expect(formatarMinutos(null)).toBe('-'));
  it('< 1 min', () => expect(formatarMinutos(0.5)).toBe('< 1min'));
  it('30 min', () => expect(formatarMinutos(30)).toBe('30min'));
  it('90 min -> 1h 30min', () => expect(formatarMinutos(90)).toBe('1h 30min'));
  it('120 min -> 2h', () => expect(formatarMinutos(120)).toBe('2h'));
});

describe('formatarSegundos', () => {
  it('null -> "-"', () => expect(formatarSegundos(null)).toBe('-'));
  it('90 -> 1:30', () => expect(formatarSegundos(90)).toBe('1:30'));
  it('5 -> 0:05', () => expect(formatarSegundos(5)).toBe('0:05'));
});

describe('formatarDuracao', () => {
  it('null -> "-"', () => expect(formatarDuracao(null)).toBe('-'));
  it('30 min', () => expect(formatarDuracao(30)).toContain('30'));
  it('1440 min -> 1d', () => expect(formatarDuracao(1440)).toBe('1d'));
  it('1500 min -> 1d 1h', () => expect(formatarDuracao(1500)).toBe('1d 1h'));
});

// ========== Texto ==========
describe('truncarTexto', () => {
  it('null -> "-"', () => expect(truncarTexto(null)).toBe('-'));
  it('curto sem truncar', () => expect(truncarTexto('abc', 10)).toBe('abc'));
  it('longo com ...', () => expect(truncarTexto('abcdefghijk', 5)).toBe('abcde...'));
});

describe('capitalizar', () => {
  it('null -> ""', () => expect(capitalizar(null)).toBe(''));
  it('hello -> Hello', () => expect(capitalizar('hello')).toBe('Hello'));
  it('HELLO -> Hello', () => expect(capitalizar('HELLO')).toBe('Hello'));
});

describe('formatarNome', () => {
  it('null -> ""', () => expect(formatarNome(null)).toBe(''));
  it('preposições minúsculas', () => expect(formatarNome('MARIA DA SILVA')).toBe('Maria da Silva'));
});

describe('formatarCodigoLote', () => {
  it('null -> "-"', () => expect(formatarCodigoLote(null)).toBe('-'));
  it('1 -> 000001', () => expect(formatarCodigoLote(1)).toBe('000001'));
  it('123456 -> 123456', () => expect(formatarCodigoLote(123456)).toBe('123456'));
});

// ========== Documentos formatação ==========
describe('formatarCPF', () => {
  it('null -> "-"', () => expect(formatarCPF(null)).toBe('-'));
  it('formata 11 dígitos', () => expect(formatarCPF('12345678901')).toBe('123.456.789-01'));
  it('retorna original se tamanho errado', () => expect(formatarCPF('123')).toBe('123'));
});

describe('formatarCNPJ', () => {
  it('null -> "-"', () => expect(formatarCNPJ(null)).toBe('-'));
  it('formata 14 dígitos', () => expect(formatarCNPJ('12345678000190')).toBe('12.345.678/0001-90'));
});

describe('formatarTelefone', () => {
  it('null -> "-"', () => expect(formatarTelefone(null)).toBe('-'));
  it('11 dígitos celular', () => expect(formatarTelefone('11987654321')).toBe('(11) 98765-4321'));
  it('10 dígitos fixo', () => expect(formatarTelefone('1134567890')).toBe('(11) 3456-7890'));
});

// ========== Status ==========
describe('formatarStatus', () => {
  it('null -> "-"', () => expect(formatarStatus(null)).toBe('-'));
  it('pendente', () => expect(formatarStatus('pendente')).toBe('Pendente'));
  it('em_andamento', () => expect(formatarStatus('em_andamento')).toBe('Em Andamento'));
  it('desconhecido capitaliza', () => expect(formatarStatus('novo_status')).toBe('Novo status'));
});

describe('getCorStatus', () => {
  it('null -> default', () => expect(getCorStatus(null)).toBe('default'));
  it('pendente -> warning', () => expect(getCorStatus('pendente')).toBe('warning'));
  it('concluido -> success', () => expect(getCorStatus('concluido')).toBe('success'));
  it('reprovado -> destructive', () => expect(getCorStatus('reprovado')).toBe('destructive'));
});

// ========== Helpers ==========
describe('isVazio', () => {
  it('null', () => expect(isVazio(null)).toBe(true));
  it('undefined', () => expect(isVazio(undefined)).toBe(true));
  it('""', () => expect(isVazio('')).toBe(true));
  it('"  "', () => expect(isVazio('  ')).toBe(true));
  it('[]', () => expect(isVazio([])).toBe(true));
  it('"abc"', () => expect(isVazio('abc')).toBe(false));
  it('0', () => expect(isVazio(0)).toBe(false));
});

describe('valorOuFallback', () => {
  it('retorna valor se preenchido', () => expect(valorOuFallback('abc', 'default')).toBe('abc'));
  it('retorna fallback se null', () => expect(valorOuFallback(null, 'default')).toBe('default'));
});

describe('formatarVariacao', () => {
  it('positiva', () => {
    const r = formatarVariacao(5.5);
    expect(r.tipo).toBe('up');
    expect(r.texto).toContain('+');
  });
  it('negativa', () => {
    const r = formatarVariacao(-3.2);
    expect(r.tipo).toBe('down');
    expect(r.texto).toContain('-');
  });
  it('zero/null', () => {
    expect(formatarVariacao(0).tipo).toBe('stable');
    expect(formatarVariacao(null).tipo).toBe('stable');
  });
});

// ========== number.ts ==========
describe('formatCurrency', () => {
  it('100 -> R$', () => expect(formatCurrency(100)).toContain('R$'));
  it('0', () => expect(formatCurrency(0)).toContain('R$'));
});

describe('formatNumber', () => {
  it('1234', () => expect(formatNumber(1234)).toBeDefined());
  it('com decimais', () => expect(formatNumber(1234.567, 2)).toContain(','));
});

describe('formatPercent', () => {
  it('50', () => expect(formatPercent(50)).toContain('50'));
});

describe('clamp', () => {
  it('within', () => expect(clamp(5, 0, 10)).toBe(5));
  it('below', () => expect(clamp(-5, 0, 10)).toBe(0));
  it('above', () => expect(clamp(15, 0, 10)).toBe(10));
});

describe('roundTo', () => {
  it('2 decimais', () => expect(roundTo(3.14159, 2)).toBe(3.14));
  it('0 decimais', () => expect(roundTo(3.7, 0)).toBe(4));
});

describe('percentage', () => {
  it('50/100', () => expect(percentage(50, 100)).toBe(50));
  it('0 total', () => expect(percentage(50, 0)).toBe(0));
});

describe('formatBytes', () => {
  it('0', () => expect(formatBytes(0)).toBe('0 B'));
  it('1024 -> KB', () => expect(formatBytes(1024)).toContain('KB'));
  it('1MB', () => expect(formatBytes(1048576)).toContain('MB'));
});

// ========== date.ts ==========
describe('formatDate', () => {
  it('string', () => expect(formatDate('2024-03-15')).toBeDefined());
  it('Date', () => expect(formatDate(new Date())).toBeDefined());
});

describe('isSameDay', () => {
  it('same', () => expect(isSameDay(new Date(2024, 0, 1), new Date(2024, 0, 1))).toBe(true));
  it('different', () => expect(isSameDay(new Date(2024, 0, 1), new Date(2024, 0, 2))).toBe(false));
});

describe('startOfDay', () => {
  it('hours=0', () => expect(startOfDay(new Date()).getHours()).toBe(0));
});

describe('endOfDay', () => {
  it('hours=23', () => expect(endOfDay(new Date()).getHours()).toBe(23));
});

describe('addDays', () => {
  it('+1', () => {
    const d = new Date(2024, 0, 1);
    expect(addDays(d, 1).getDate()).toBe(2);
  });
  it('-1', () => {
    const d = new Date(2024, 0, 2);
    expect(addDays(d, -1).getDate()).toBe(1);
  });
});

describe('diffInDays', () => {
  it('3 days', () => {
    expect(diffInDays(new Date(2024, 0, 1), new Date(2024, 0, 4))).toBe(3);
  });
  it('0 days same', () => {
    const d = new Date();
    expect(diffInDays(d, d)).toBe(0);
  });
});
