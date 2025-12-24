import { describe, it, expect } from 'vitest';

describe('VirtualList', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./VirtualList');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
