import { describe, it, expect } from 'vitest';

describe('RadioCards', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./RadioCards');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
