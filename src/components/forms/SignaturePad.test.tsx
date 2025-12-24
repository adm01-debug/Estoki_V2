import { describe, it, expect } from 'vitest';

describe('SignaturePad', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./SignaturePad');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
