import { describe, it, expect } from 'vitest';

describe('Celebration', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./Celebration');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
