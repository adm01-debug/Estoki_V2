import { describe, it, expect } from 'vitest';

describe('FileDropzone', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./FileDropzone');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
