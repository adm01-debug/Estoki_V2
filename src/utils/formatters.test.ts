import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatNumber } from './formatters';

describe('formatters', () => {
  it('should format currency correctly', () => {
    // Note: implementation might depend on locale, checking partial match
    const result = formatCurrency(1234.56);
    expect(result).toContain('1.234,56');
  });

  it('should format dates correctly', () => {
    const date = new Date('2023-12-25T12:00:00');
    const result = formatDate(date.toISOString());
    expect(result).toBe('25/12/2023');
  });

  it('should format numbers with decimals', () => {
    expect(formatNumber(10.5)).toBe('10,5');
    expect(formatNumber(1000)).toBe('1.000');
  });
});
