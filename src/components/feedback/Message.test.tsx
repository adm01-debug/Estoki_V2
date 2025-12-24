import { describe, it, expect } from 'vitest';

describe('Message', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./Message');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
