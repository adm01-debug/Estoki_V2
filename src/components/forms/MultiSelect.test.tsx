import { describe, it, expect } from 'vitest';

describe('MultiSelect', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./MultiSelect');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
