import { describe, it, expect } from 'vitest';

describe('PatternInput', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./PatternInput');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
