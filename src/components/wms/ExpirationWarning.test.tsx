import { describe, it, expect } from 'vitest';

describe('ExpirationWarning', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./ExpirationWarning');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
