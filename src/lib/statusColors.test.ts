import { describe, it, expect } from 'vitest';
import {
  getStatusClasses,
  getStatusLabel,
  getVariantClasses,
  type StatusVariant,
} from './statusColors';

describe('statusColors', () => {
  // ─── getStatusClasses ───
  describe('getStatusClasses', () => {
    it.each([
      ['success', 'bg-success/10 text-success border-success/20'],
      ['ok', 'bg-success/10 text-success border-success/20'],
      ['aprovado', 'bg-success/10 text-success border-success/20'],
      ['conferido', 'bg-success/10 text-success border-success/20'],
      ['recebido', 'bg-success/10 text-success border-success/20'],
    ])('returns success classes for status "%s"', (status, expected) => {
      expect(getStatusClasses(status)).toBe(expected);
    });

    it.each([
      ['danger', 'bg-destructive/10 text-destructive border-destructive/20'],
      ['divergencia', 'bg-destructive/10 text-destructive border-destructive/20'],
      ['reprovado', 'bg-destructive/10 text-destructive border-destructive/20'],
      ['cancelado', 'bg-destructive/10 text-destructive border-destructive/20'],
    ])('returns danger classes for status "%s"', (status, expected) => {
      expect(getStatusClasses(status)).toBe(expected);
    });

    it.each([
      ['warning', 'bg-warning/10 text-warning border-warning/20'],
      ['aguardando', 'bg-warning/10 text-warning border-warning/20'],
      ['em_transito', 'bg-warning/10 text-warning border-warning/20'],
      ['pendente', 'bg-warning/10 text-warning border-warning/20'],
    ])('returns warning classes for status "%s"', (status, expected) => {
      expect(getStatusClasses(status)).toBe(expected);
    });

    it.each([
      ['info', 'bg-info/10 text-info border-info/20'],
      ['triagem', 'bg-info/10 text-info border-info/20'],
      ['em_andamento', 'bg-info/10 text-info border-info/20'],
    ])('returns info classes for status "%s"', (status, expected) => {
      expect(getStatusClasses(status)).toBe(expected);
    });

    it('returns default classes for unknown status', () => {
      expect(getStatusClasses('unknown_status')).toBe('bg-muted text-muted-foreground border-border');
    });

    it('returns default classes for empty string', () => {
      expect(getStatusClasses('')).toBe('bg-muted text-muted-foreground border-border');
    });
  });

  // ─── getStatusLabel ───
  describe('getStatusLabel', () => {
    it.each([
      ['success', 'Sucesso'],
      ['ok', 'OK'],
      ['aprovado', 'Aprovado'],
      ['conferido', 'Conferido'],
      ['recebido', 'Recebido'],
      ['danger', 'Erro'],
      ['divergencia', 'Divergência'],
      ['reprovado', 'Reprovado'],
      ['cancelado', 'Cancelado'],
      ['warning', 'Atenção'],
      ['aguardando', 'Aguardando'],
      ['em_transito', 'Em Trânsito'],
      ['pendente', 'Pendente'],
      ['info', 'Informação'],
      ['triagem', 'Triagem'],
      ['em_andamento', 'Em Andamento'],
    ])('returns "%s" → "%s"', (status, expected) => {
      expect(getStatusLabel(status)).toBe(expected);
    });

    it('returns the raw status string for unmapped values', () => {
      expect(getStatusLabel('custom_status')).toBe('custom_status');
    });

    it('returns empty string for empty input', () => {
      expect(getStatusLabel('')).toBe('');
    });
  });

  // ─── getVariantClasses ───
  describe('getVariantClasses', () => {
    it('returns success variant classes', () => {
      const result = getVariantClasses('success');
      expect(result.bg).toBe('bg-success/10');
      expect(result.text).toBe('text-success');
      expect(result.border).toBe('border-success/20');
    });

    it('returns danger variant classes', () => {
      const result = getVariantClasses('danger');
      expect(result.bg).toBe('bg-destructive/10');
      expect(result.text).toBe('text-destructive');
      expect(result.border).toBe('border-destructive/20');
    });

    it('returns warning variant classes', () => {
      const result = getVariantClasses('warning');
      expect(result.bg).toBe('bg-warning/10');
      expect(result.text).toBe('text-warning');
      expect(result.border).toBe('border-warning/20');
    });

    it('returns info variant classes', () => {
      const result = getVariantClasses('info');
      expect(result.bg).toBe('bg-info/10');
      expect(result.text).toBe('text-info');
      expect(result.border).toBe('border-info/20');
    });

    it('returns primary (default) variant classes', () => {
      const result = getVariantClasses('default');
      expect(result.bg).toBe('bg-primary/10');
      expect(result.text).toBe('text-primary');
      expect(result.border).toBe('border-primary/20');
    });

    it('returns all three keys for every variant', () => {
      const variants: StatusVariant[] = ['success', 'danger', 'warning', 'info', 'default'];
      variants.forEach((v) => {
        const result = getVariantClasses(v);
        expect(result).toHaveProperty('bg');
        expect(result).toHaveProperty('text');
        expect(result).toHaveProperty('border');
      });
    });
  });
});
