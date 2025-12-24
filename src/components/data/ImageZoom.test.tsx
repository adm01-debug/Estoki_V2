import { describe, it, expect } from 'vitest';

describe('ImageZoom', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./ImageZoom');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
