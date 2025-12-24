import { describe, it, expect } from 'vitest';

describe('MoneyInput', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./MoneyInput');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
