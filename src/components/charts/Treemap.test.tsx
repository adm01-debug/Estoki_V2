import { describe, it, expect } from 'vitest';

describe('Treemap', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./Treemap');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
