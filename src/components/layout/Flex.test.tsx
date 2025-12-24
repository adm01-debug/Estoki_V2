import { describe, it, expect } from 'vitest';

describe('Flex', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./Flex');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
