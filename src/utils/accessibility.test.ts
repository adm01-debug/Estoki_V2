import { describe, it, expect, vi } from 'vitest';
import {
  getIconButtonProps,
  announceToScreenReader,
  trapFocus,
  prefersReducedMotion,
  generateA11yId,
  srOnlyStyle,
} from './accessibility';

describe('accessibility utilities', () => {
  // ─── getIconButtonProps ───
  describe('getIconButtonProps', () => {
    it('returns aria-label and title', () => {
      const result = getIconButtonProps('Fechar');
      expect(result['aria-label']).toBe('Fechar');
      expect(result.title).toBe('Fechar');
    });

    it('handles empty string', () => {
      const result = getIconButtonProps('');
      expect(result['aria-label']).toBe('');
    });
  });

  // ─── announceToScreenReader ───
  describe('announceToScreenReader', () => {
    it('creates and removes an element from the DOM', async () => {
      vi.useFakeTimers();
      announceToScreenReader('Salvo com sucesso');

      const el = document.querySelector('[role="status"]');
      expect(el).toBeTruthy();
      expect(el?.textContent).toBe('Salvo com sucesso');

      vi.advanceTimersByTime(1100);
      expect(document.querySelector('[role="status"]')).toBeNull();
      vi.useRealTimers();
    });

    it('uses polite priority by default', () => {
      vi.useFakeTimers();
      announceToScreenReader('Mensagem');
      const el = document.querySelector('[aria-live="polite"]');
      expect(el).toBeTruthy();
      vi.advanceTimersByTime(1100);
      vi.useRealTimers();
    });

    it('supports assertive priority', () => {
      vi.useFakeTimers();
      announceToScreenReader('Erro crítico', 'assertive');
      const el = document.querySelector('[aria-live="assertive"]');
      expect(el).toBeTruthy();
      vi.advanceTimersByTime(1100);
      vi.useRealTimers();
    });
  });

  // ─── trapFocus ───
  describe('trapFocus', () => {
    it('returns a cleanup function', () => {
      const container = document.createElement('div');
      const btn1 = document.createElement('button');
      const btn2 = document.createElement('button');
      container.appendChild(btn1);
      container.appendChild(btn2);
      document.body.appendChild(container);

      const cleanup = trapFocus(container);
      expect(typeof cleanup).toBe('function');
      
      cleanup();
      document.body.removeChild(container);
    });

    it('focuses the first focusable element', () => {
      const container = document.createElement('div');
      const input = document.createElement('input');
      const button = document.createElement('button');
      container.appendChild(input);
      container.appendChild(button);
      document.body.appendChild(container);

      const cleanup = trapFocus(container);
      expect(document.activeElement).toBe(input);

      cleanup();
      document.body.removeChild(container);
    });
  });

  // ─── prefersReducedMotion ───
  describe('prefersReducedMotion', () => {
    it('returns a boolean', () => {
      const result = prefersReducedMotion();
      expect(typeof result).toBe('boolean');
    });

    it('returns false with default matchMedia mock', () => {
      expect(prefersReducedMotion()).toBe(false);
    });
  });

  // ─── generateA11yId ───
  describe('generateA11yId', () => {
    it('generates unique IDs', () => {
      const id1 = generateA11yId();
      const id2 = generateA11yId();
      expect(id1).not.toBe(id2);
    });

    it('uses default prefix', () => {
      const id = generateA11yId();
      expect(id).toMatch(/^a11y-\d+$/);
    });

    it('uses custom prefix', () => {
      const id = generateA11yId('field');
      expect(id).toMatch(/^field-\d+$/);
    });
  });

  // ─── srOnlyStyle ───
  describe('srOnlyStyle', () => {
    it('has all required CSS properties', () => {
      expect(srOnlyStyle.position).toBe('absolute');
      expect(srOnlyStyle.width).toBe('1px');
      expect(srOnlyStyle.height).toBe('1px');
      expect(srOnlyStyle.overflow).toBe('hidden');
    });
  });
});
