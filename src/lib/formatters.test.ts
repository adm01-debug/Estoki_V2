import { describe, it, expect } from 'vitest';
import { formatNumber, formatPercent, formatFileSize, formatCurrency, formatDate, formatCPF, formatCNPJ, truncate, slugify, capitalize, titleCase } from './formatters';

describe('formatters', () => {
  it('should format number', () => {
    expect(formatNumber(1234567)).toBe('1.234.567');
  });

  it('should format percent', () => {
    expect(formatPercent(50)).toContain('50');
  });

  it('should format file size', () => {
    expect(formatFileSize(1024)).toContain('KB');
    expect(formatFileSize(0)).toBe('0 B');
  });

  it('should handle null values gracefully', () => {
    expect(formatNumber(null)).toBe('-');
    expect(formatNumber(undefined)).toBe('-');
    expect(formatPercent(null)).toBe('-');
    expect(formatCurrency(null)).toBe('-');
    expect(formatDate(null)).toBe('-');
    expect(formatFileSize(null)).toBe('-');
    expect(formatCPF(null)).toBe('-');
    expect(formatCNPJ(null)).toBe('-');
    expect(truncate(null, 10)).toBe('');
    expect(slugify(null)).toBe('');
    expect(capitalize(null)).toBe('');
    expect(titleCase(null)).toBe('');
  });

  it('should format CPF correctly', () => {
    expect(formatCPF('52998224725')).toBe('529.982.247-25');
  });

  it('should format CNPJ correctly', () => {
    expect(formatCNPJ('11222333000181')).toBe('11.222.333/0001-81');
  });

  it('should truncate long strings', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...');
    expect(truncate('Hi', 5)).toBe('Hi');
  });

  it('should slugify', () => {
    expect(slugify('Hello World')).toBe('hello-world');
    expect(slugify('São Paulo')).toBe('sao-paulo');
  });

  it('should capitalize', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('should title case', () => {
    expect(titleCase('hello world')).toBe('Hello World');
  });
});
