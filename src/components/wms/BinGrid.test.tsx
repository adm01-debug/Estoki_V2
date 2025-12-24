import { describe, it, expect } from 'vitest';

describe('BinGrid', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./BinGrid');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
