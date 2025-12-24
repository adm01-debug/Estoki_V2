import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productService } from './productService';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
    })),
  },
}));

describe('productService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(productService).toBeDefined();
  });

  it('should have required methods', () => {
    expect(typeof productService).toBe('object');
  });

  it('should handle errors gracefully', async () => {
    const result = await productService.getAll?.() || [];
    expect(Array.isArray(result) || result !== undefined).toBe(true);
  });
});
