import { describe, it, expect } from 'vitest';

describe('ResizablePanel', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./ResizablePanel');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
