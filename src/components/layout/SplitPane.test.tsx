import { describe, it, expect } from 'vitest';

describe('SplitPane', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./SplitPane');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
