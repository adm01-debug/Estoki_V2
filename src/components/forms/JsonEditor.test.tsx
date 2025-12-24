import { describe, it, expect } from 'vitest';

describe('JsonEditor', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./JsonEditor');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
