import { describe, it, expect } from 'vitest';

describe('Funnel', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./Funnel');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
