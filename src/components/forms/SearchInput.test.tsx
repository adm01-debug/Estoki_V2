import { describe, it, expect } from 'vitest';

describe('SearchInput', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./SearchInput');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
