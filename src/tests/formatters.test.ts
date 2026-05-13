import { describe, it, expect } from 'vitest';
import { 
  formatCurrency, 
  formatDate, 
  formatCPF, 
  formatWeight,
  formatFileSize 
} from '../lib/formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('deve formatar valores monetários corretamente', () => {
      // Usando regex para ignorar variações de espaços (NBSP vs space)
      const result = formatCurrency(1000.5).replace(/\s/g, ' ');
      expect(result).toMatch(/R$ 1\.000,50/);
    });

    it('deve retornar "-" para valores inválidos', () => {
      expect(formatCurrency(null as any)).toBe('-');
      expect(formatCurrency(undefined as any)).toBe('-');
    });
  });

  describe('formatDate', () => {
    it('deve formatar datas no padrão brasileiro', () => {
      const date = new Date(2023, 11, 25); // 25/12/2023
      expect(formatDate(date)).toBe('25/12/2023');
    });

    it('deve retornar "-" para datas nulas', () => {
      expect(formatDate(null)).toBe('-');
    });
  });

  describe('formatCPF', () => {
    it('deve formatar CPF com máscara', () => {
      expect(formatCPF('12345678901')).toBe('123.456.789-01');
    });

    it('deve retornar "-" para CPF vazio', () => {
      expect(formatCPF('')).toBe('-');
    });
  });

  describe('formatWeight', () => {
    it('deve formatar gramas e kilos', () => {
      expect(formatWeight(500)).toBe('500 g');
      expect(formatWeight(1500)).toBe('1.50 kg');
    });
  });

  describe('formatFileSize', () => {
    it('deve formatar tamanhos de arquivo legíveis', () => {
      expect(formatFileSize(500)).toBe('500 B');
      expect(formatFileSize(1024 * 10.5)).toBe('10.5 KB');
      expect(formatFileSize(1024 * 1024 * 2)).toBe('2.0 MB');
    });
  });
});
