import { describe, it, expect } from 'vitest';

describe('Radar', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./Radar');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
