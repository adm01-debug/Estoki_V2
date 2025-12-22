import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatNumber, formatPercentage } from './formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('should format BRL currency', () => {
      const result = formatCurrency(1234.56);
      expect(result).toContain('1.234');
    });
  });

  describe('formatDate', () => {
    it('should format date', () => {
      const result = formatDate('2024-01-15');
      expect(result).toBeDefined();
    });
  });

  describe('formatNumber', () => {
    it('should format number with decimals', () => {
      const result = formatNumber(1234.567, 2);
      expect(result).toContain('1.234');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage', () => {
      const result = formatPercentage(0.75);
      expect(result).toContain('75');
    });
  });
});
