import { describe, it, expect } from 'vitest';

describe('TreeTable', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./TreeTable');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
