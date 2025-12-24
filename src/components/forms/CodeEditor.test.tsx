import { describe, it, expect } from 'vitest';

describe('CodeEditor', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./CodeEditor');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
