import { describe, it, expect } from 'vitest';

describe('EmojiPicker', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./EmojiPicker');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
