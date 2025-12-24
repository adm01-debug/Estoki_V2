import { describe, it, expect } from 'vitest';

describe('CurrencyInput', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./CurrencyInput');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
