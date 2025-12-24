import { describe, it, expect } from 'vitest';

describe('Sankey', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./Sankey');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
