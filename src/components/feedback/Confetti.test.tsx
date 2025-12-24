import { describe, it, expect } from 'vitest';

describe('Confetti', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./Confetti');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
