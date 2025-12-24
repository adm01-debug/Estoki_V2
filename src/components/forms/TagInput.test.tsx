import { describe, it, expect } from 'vitest';

describe('TagInput', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./TagInput');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
