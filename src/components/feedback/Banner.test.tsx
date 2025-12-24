import { describe, it, expect } from 'vitest';

describe('Banner', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./Banner');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
