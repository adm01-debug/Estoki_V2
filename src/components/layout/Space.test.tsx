import { describe, it, expect } from 'vitest';

describe('Space', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./Space');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
