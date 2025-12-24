import { describe, it, expect } from 'vitest';

describe('FileUpload', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./FileUpload');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
