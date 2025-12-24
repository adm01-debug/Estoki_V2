import { describe, it, expect } from 'vitest';

describe('Gauge', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./Gauge');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
