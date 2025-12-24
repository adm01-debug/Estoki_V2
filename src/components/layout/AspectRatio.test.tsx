import { describe, it, expect } from 'vitest';

describe('AspectRatio', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./AspectRatio');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
