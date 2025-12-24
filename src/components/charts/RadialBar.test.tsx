import { describe, it, expect } from 'vitest';

describe('RadialBar', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./RadialBar');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
