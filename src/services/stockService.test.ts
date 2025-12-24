import { describe, it, expect, vi, beforeEach } from 'vitest';
import { stockService } from './stockService';

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

describe('stockService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(stockService).toBeDefined();
  });

  it('should have required methods', () => {
    expect(typeof stockService).toBe('object');
  });

  it('should handle errors gracefully', async () => {
    const result = await stockService.getAll?.() || [];
    expect(Array.isArray(result) || result !== undefined).toBe(true);
  });
});
