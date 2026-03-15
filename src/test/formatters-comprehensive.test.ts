import { describe, it, expect } from 'vitest';
import {
  formatarData, formatarDataHora, formatarDataCurta, formatarHora,
  formatarNumero, formatarPercentual, formatarMoeda, formatarNumeroCompacto,
  formatarQuantidade, formatarMinutos, formatarSegundos, formatarDuracao,
  truncarTexto, capitalizar, formatarNome, formatarCodigoLote,
  formatarCPF, formatarCNPJ, formatarTelefone,
  formatarStatus, getCorStatus, isVazio, valorOuFallback, formatarVariacao,
} from '@/utils/formatters';
import {
  formatCurrency, formatNumber, formatPercent, formatDate, formatDateTime,
  formatRelativeTime, formatCPF as libFormatCPF, formatCNPJ as libFormatCNPJ,
  formatPhone, formatCEP, formatWeight, formatFileSize, formatDimensions,
  truncate, slugify, capitalize, titleCase,
} from '@/lib/formatters';

// =============================================
// DATE FORMATTING - ~20 scenarios
// =============================================
describe('Date Formatting (utils)', () => {
  it('formats ISO date dd/MM/yyyy', () => {
    expect(formatarData('2024-03-15')).toBe('15/03/2024');
  });
  it('formats Date object', () => {
    expect(formatarData(new Date(2024, 2, 15))).toBe('15/03/2024');
  });
  it('returns dash for null', () => expect(formatarData(null)).toBe('-'));
  it('returns dash for undefined', () => expect(formatarData(undefined)).toBe('-'));
  it('returns dash for invalid', () => expect(formatarData('invalid')).toBe('-'));

  it('formats date+time', () => {
    const result = formatarDataHora('2024-03-15T14:30:00');
    expect(result).toContain('15/03/2024');
    expect(result).toContain('14:30');
  });
  it('date+time null returns dash', () => expect(formatarDataHora(null)).toBe('-'));

  it('formats short date', () => {
    expect(formatarDataCurta('2024-03-15')).toBe('15/03');
  });
  it('short date null returns dash', () => expect(formatarDataCurta(null)).toBe('-'));

  it('formats time only', () => {
    const result = formatarHora('2024-03-15T14:30:00');
    expect(result).toBe('14:30');
  });
  it('time null returns dash', () => expect(formatarHora(null)).toBe('-'));
});

describe('Date Formatting (lib)', () => {
  it('formats short date', () => {
    const result = formatDate('2024-03-15', 'short');
    expect(result).toContain('15');
    expect(result).toContain('03');
    expect(result).toContain('2024');
  });
  it('formats date+time', () => {
    const result = formatDateTime('2024-03-15T14:30:00');
    expect(result).toBeTruthy();
  });
  it('relative time "agora"', () => {
    const result = formatRelativeTime(new Date());
    expect(result).toBe('agora');
  });
  it('relative time minutes', () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - 5);
    expect(formatRelativeTime(d)).toBe('5min atrás');
  });
  it('relative time hours', () => {
    const d = new Date();
    d.setHours(d.getHours() - 3);
    expect(formatRelativeTime(d)).toBe('3h atrás');
  });
  it('relative time days', () => {
    const d = new Date();
    d.setDate(d.getDate() - 2);
    expect(formatRelativeTime(d)).toBe('2d atrás');
  });
});

// =============================================
// NUMBER FORMATTING - ~25 scenarios
// =============================================
describe('Number Formatting (utils)', () => {
  it('formats 1000 with separator', () => expect(formatarNumero(1000)).toBe('1.000'));
  it('formats 1234567', () => expect(formatarNumero(1234567)).toBe('1.234.567'));
  it('null returns dash', () => expect(formatarNumero(null)).toBe('-'));
  
  it('formats percent 75.5', () => expect(formatarPercentual(75.5)).toBe('75,5%'));
  it('formats percent 100', () => expect(formatarPercentual(100, 0)).toBe('100%'));
  it('percent null returns dash', () => expect(formatarPercentual(null)).toBe('-'));
  
  it('formats currency', () => {
    const result = formatarMoeda(1234.56);
    expect(result).toContain('1.234,56');
    expect(result).toContain('R$');
  });
  it('currency null returns dash', () => expect(formatarMoeda(null)).toBe('-'));
  
  it('compact 1500 -> 1,5K', () => expect(formatarNumeroCompacto(1500)).toBe('1,5K'));
  it('compact 1000000 -> 1,0M', () => expect(formatarNumeroCompacto(1000000)).toBe('1,0M'));
  it('compact 500 stays 500', () => expect(formatarNumeroCompacto(500)).toBe('500'));
  it('compact null returns dash', () => expect(formatarNumeroCompacto(null)).toBe('-'));
  
  it('quantity with unit', () => expect(formatarQuantidade(100, 'kg')).toBe('100 kg'));
  it('quantity default unit', () => expect(formatarQuantidade(50)).toBe('50 un'));
  it('quantity null returns dash', () => expect(formatarQuantidade(null)).toBe('-'));
});

describe('Number Formatting (lib)', () => {
  it('formats currency BRL', () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain('1.234,56');
  });
  it('formats number with decimals', () => {
    expect(formatNumber(1234.567, 2)).toBe('1.234,57');
  });
  it('formats percent', () => {
    const result = formatPercent(75.5);
    expect(result).toContain('75,5');
    expect(result).toContain('%');
  });
});

// =============================================
// TIME/DURATION FORMATTING - ~15 scenarios
// =============================================
describe('Time/Duration Formatting', () => {
  it('< 1 min', () => expect(formatarMinutos(0.5)).toBe('< 1min'));
  it('30 min', () => expect(formatarMinutos(30)).toBe('30min'));
  it('60 min -> 1h', () => expect(formatarMinutos(60)).toBe('1h'));
  it('90 min -> 1h 30min', () => expect(formatarMinutos(90)).toBe('1h 30min'));
  it('null returns dash', () => expect(formatarMinutos(null)).toBe('-'));
  
  it('seconds 90 -> 1:30', () => expect(formatarSegundos(90)).toBe('1:30'));
  it('seconds 5 -> 0:05', () => expect(formatarSegundos(5)).toBe('0:05'));
  it('seconds null returns dash', () => expect(formatarSegundos(null)).toBe('-'));
  
  it('duration < 60 min', () => expect(formatarDuracao(45)).toBe('45 min'));
  it('duration 120 min -> 2h', () => expect(formatarDuracao(120)).toBe('2h'));
  it('duration 150 min -> 2h 30min', () => expect(formatarDuracao(150)).toBe('2h 30min'));
  it('duration 1440 min -> 1d', () => expect(formatarDuracao(1440)).toBe('1d'));
  it('duration 1560 min -> 1d 2h', () => expect(formatarDuracao(1560)).toBe('1d 2h'));
  it('duration null returns dash', () => expect(formatarDuracao(null)).toBe('-'));
});

// =============================================
// TEXT FORMATTING - ~25 scenarios
// =============================================
describe('Text Formatting (utils)', () => {
  it('truncates long text', () => {
    expect(truncarTexto('abcdefghij', 5)).toBe('abcde...');
  });
  it('does not truncate short text', () => {
    expect(truncarTexto('abc', 5)).toBe('abc');
  });
  it('truncate null returns dash', () => expect(truncarTexto(null)).toBe('-'));
  
  it('capitalizes', () => expect(capitalizar('HELLO')).toBe('Hello'));
  it('capitalize null returns empty', () => expect(capitalizar(null)).toBe(''));
  
  it('formats name with prepositions', () => {
    expect(formatarNome('MARIA DA SILVA')).toBe('Maria da Silva');
  });
  it('formats name "JOAO DOS SANTOS"', () => {
    expect(formatarNome('JOAO DOS SANTOS')).toBe('Joao dos Santos');
  });
  it('formats name null returns empty', () => expect(formatarNome(null)).toBe(''));
  
  it('formats lot code with padding', () => {
    expect(formatarCodigoLote('42')).toBe('000042');
    expect(formatarCodigoLote(7, 4)).toBe('0007');
  });
  it('lot code null returns dash', () => expect(formatarCodigoLote(null)).toBe('-'));
});

describe('Text Formatting (lib)', () => {
  it('truncate', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...');
  });
  it('slugify', () => {
    expect(slugify('Olá Mundo!')).toBe('ola-mundo');
  });
  it('capitalize', () => {
    expect(capitalize('hello')).toBe('Hello');
  });
  it('titleCase', () => {
    expect(titleCase('hello world')).toBe('Hello World');
  });
});

// =============================================
// DOCUMENT FORMATTING - ~15 scenarios
// =============================================
describe('Document Formatting', () => {
  it('formats CPF', () => {
    expect(formatarCPF('52998224725')).toBe('529.982.247-25');
  });
  it('CPF null returns dash', () => expect(formatarCPF(null)).toBe('-'));
  it('CPF wrong length returns as-is', () => expect(formatarCPF('123')).toBe('123'));
  
  it('formats CNPJ', () => {
    expect(formatarCNPJ('11222333000181')).toBe('11.222.333/0001-81');
  });
  it('CNPJ null returns dash', () => expect(formatarCNPJ(null)).toBe('-'));
  
  it('formats mobile phone', () => {
    expect(formatarTelefone('11999887766')).toBe('(11) 99988-7766');
  });
  it('formats landline phone', () => {
    expect(formatarTelefone('1133445566')).toBe('(11) 3344-5566');
  });
  it('phone null returns dash', () => expect(formatarTelefone(null)).toBe('-'));
  
  // lib formatters
  it('lib formats CPF', () => expect(libFormatCPF('52998224725')).toBe('529.982.247-25'));
  it('lib formats CNPJ', () => expect(libFormatCNPJ('11222333000181')).toBe('11.222.333/0001-81'));
  it('lib formats phone', () => expect(formatPhone('11999887766')).toBe('(11) 99988-7766'));
  it('lib formats CEP', () => expect(formatCEP('01001000')).toBe('01001-000'));
});

// =============================================
// WEIGHT/FILE SIZE FORMATTING - ~8 scenarios
// =============================================
describe('Weight and File Size Formatting', () => {
  it('weight grams', () => expect(formatWeight(500)).toBe('500 g'));
  it('weight kg', () => expect(formatWeight(1500)).toBe('1.50 kg'));
  
  it('file bytes', () => expect(formatFileSize(500)).toBe('500 B'));
  it('file KB', () => expect(formatFileSize(1500)).toBe('1.5 KB'));
  it('file MB', () => expect(formatFileSize(1500000)).toBe('1.4 MB'));
  it('file GB', () => expect(formatFileSize(1500000000)).toBe('1.40 GB'));
  
  it('dimensions', () => expect(formatDimensions(10, 20, 30)).toBe('10 × 20 × 30 cm'));
});

// =============================================
// STATUS FORMATTING - ~15 scenarios
// =============================================
describe('Status Formatting', () => {
  it('pendente', () => expect(formatarStatus('pendente')).toBe('Pendente'));
  it('em_andamento', () => expect(formatarStatus('em_andamento')).toBe('Em Andamento'));
  it('concluido', () => expect(formatarStatus('concluido')).toBe('Concluído'));
  it('aprovado', () => expect(formatarStatus('aprovado')).toBe('Aprovado'));
  it('unknown status is capitalized', () => {
    expect(formatarStatus('custom_status')).toBe('Custom status');
  });
  it('null returns dash', () => expect(formatarStatus(null)).toBe('-'));
  
  it('color pendente = warning', () => expect(getCorStatus('pendente')).toBe('warning'));
  it('color concluido = success', () => expect(getCorStatus('concluido')).toBe('success'));
  it('color reprovado = destructive', () => expect(getCorStatus('reprovado')).toBe('destructive'));
  it('color cancelado = secondary', () => expect(getCorStatus('cancelado')).toBe('secondary'));
  it('color unknown = default', () => expect(getCorStatus('xyz')).toBe('default'));
  it('color null = default', () => expect(getCorStatus(null)).toBe('default'));
});

// =============================================
// HELPER FUNCTIONS - ~12 scenarios
// =============================================
describe('Helper Functions', () => {
  it('isVazio null', () => expect(isVazio(null)).toBe(true));
  it('isVazio undefined', () => expect(isVazio(undefined)).toBe(true));
  it('isVazio empty string', () => expect(isVazio('')).toBe(true));
  it('isVazio spaces', () => expect(isVazio('   ')).toBe(true));
  it('isVazio empty array', () => expect(isVazio([])).toBe(true));
  it('isVazio non-empty string', () => expect(isVazio('a')).toBe(false));
  it('isVazio number 0', () => expect(isVazio(0)).toBe(false));
  
  it('valorOuFallback with value', () => expect(valorOuFallback('hello', 'default')).toBe('hello'));
  it('valorOuFallback with null', () => expect(valorOuFallback(null, 'default')).toBe('default'));
  
  it('variação positiva', () => {
    const r = formatarVariacao(5.3);
    expect(r.texto).toBe('+5,3%');
    expect(r.tipo).toBe('up');
  });
  it('variação negativa', () => {
    const r = formatarVariacao(-3.2);
    expect(r.texto).toBe('-3,2%');
    expect(r.tipo).toBe('down');
  });
  it('variação estável', () => {
    const r = formatarVariacao(0.05);
    expect(r.texto).toBe('0%');
    expect(r.tipo).toBe('stable');
  });
});
