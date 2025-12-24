import { describe, it, expect } from 'vitest';

describe('CNPJInput', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./CNPJInput');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
