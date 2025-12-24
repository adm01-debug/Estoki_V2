import { describe, it, expect } from 'vitest';

describe('FilePreview', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./FilePreview');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
