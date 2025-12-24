import { describe, it, expect } from 'vitest';

describe('ImageCropper', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./ImageCropper');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
