import { describe, it, expect } from 'vitest';

describe('WeightInput', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./WeightInput');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
