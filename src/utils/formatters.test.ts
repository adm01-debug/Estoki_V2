import { describe, it, expect } from 'vitest';
import { formatarMoeda, formatarData, formatarNumero } from './formatters';

describe('formatters', () => {
  it('should format currency correctly', () => {
    const result = formatarMoeda(1234.56).replace(/\u00A0/g, ' ');
    expect(result).toContain('1.234,56');
    expect(result).toContain('R$');
  });

  it('should format dates correctly', () => {
    const result = formatarData('2023-12-25');
    expect(result).toBe('25/12/2023');
  });

  it('should format numbers with decimals', () => {
    expect(formatarNumero(10.5)).toBe('10,5');
    expect(formatarNumero(1000)).toBe('1.000');
  });
});
