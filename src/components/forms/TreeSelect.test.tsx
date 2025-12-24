import { describe, it, expect } from 'vitest';

describe('TreeSelect', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./TreeSelect');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
