import { describe, it, expect } from 'vitest';
import { 
  formatCurrency, 
  formatNumber, 
  formatPercent, 
  formatDate, 
  formatCPF, 
  formatCNPJ, 
  formatPhone, 
  formatCEP,
  formatWeight,
  formatFileSize,
  truncate,
  slugify
} from './formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('formats numbers as BRL currency by default', () => {
      // Use a regex because of non-breaking spaces in some Intl environments
      expect(formatCurrency(1234.56)).toMatch(/R\$\s*1\.234,56/);
    });
    it('returns "-" for null/undefined', () => {
      expect(formatCurrency(null)).toBe('-');
      expect(formatCurrency(undefined)).toBe('-');
    });
  });

  describe('formatNumber', () => {
    it('formats numbers with Brazilian separators', () => {
      expect(formatNumber(1234.56, 2)).toBe('1.234,56');
    });
  });

  describe('formatPercent', () => {
    it('formats decimal as percentage', () => {
      expect(formatPercent(10.5, 1)).toMatch(/10,5\s*%/);
    });
  });

  describe('formatDate', () => {
    it('formats date string correctly', () => {
      expect(formatDate('2024-01-30')).toBe('30/01/2024');
    });
    it('returns "-" for invalid dates', () => {
      expect(formatDate('invalid')).toBe('-');
    });
  });

  describe('formatCPF', () => {
    it('masks CPF correctly', () => {
      expect(formatCPF('12345678901')).toBe('123.456.789-01');
    });
  });

  describe('formatCNPJ', () => {
    it('masks CNPJ correctly', () => {
      expect(formatCNPJ('12345678000199')).toBe('12.345.678/0001-99');
    });
  });

  describe('formatPhone', () => {
    it('formats mobile phone with 11 digits', () => {
      expect(formatPhone('11988887777')).toBe('(11) 98888-7777');
    });
    it('formats landline with 10 digits', () => {
      expect(formatPhone('1133334444')).toBe('(11) 3333-4444');
    });
  });

  describe('formatCEP', () => {
    it('masks CEP correctly', () => {
      expect(formatCEP('01234567')).toBe('01234-567');
    });
  });

  describe('formatWeight', () => {
    it('formats grams as kg if >= 1000', () => {
      expect(formatWeight(1500)).toBe('1.50 s kg'); // wait, formatter code says: grams >= 1000 ? fixed(2) kg : grams g
      // checking src: return `${(grams / 1000).toFixed(2)} kg`;
      expect(formatWeight(1500)).toBe('1.50 kg');
    });
    it('formats as g if < 1000', () => {
      expect(formatWeight(500)).toBe('500 g');
    });
  });

  describe('formatFileSize', () => {
    it('formats bytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
    });
  });

  describe('truncate', () => {
    it('truncates strings', () => {
      expect(truncate('Hello World', 5)).toBe('Hello...');
    });
    it('does not truncate short strings', () => {
      expect(truncate('Hi', 5)).toBe('Hi');
    });
  });

  describe('slugify', () => {
    it('converts to URL-safe string', () => {
      expect(slugify('Atenção: Teste de Slug! ')).toBe('atencao-teste-de-slug');
    });
  });
});