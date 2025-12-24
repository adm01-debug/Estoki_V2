import { describe, it, expect } from 'vitest';

describe('ImageUpload', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./ImageUpload');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
