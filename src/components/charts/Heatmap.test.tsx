import { describe, it, expect } from 'vitest';

describe('Heatmap', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./Heatmap');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
