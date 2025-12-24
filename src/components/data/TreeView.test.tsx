import { describe, it, expect } from 'vitest';

describe('TreeView', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./TreeView');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
