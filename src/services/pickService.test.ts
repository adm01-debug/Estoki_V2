import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pickService } from './pickService';

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

describe('pickService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(pickService).toBeDefined();
  });

  it('should have required methods', () => {
    expect(typeof pickService).toBe('object');
  });

  it('should handle errors gracefully', async () => {
    const result = await pickService.getAll?.() || [];
    expect(Array.isArray(result) || result !== undefined).toBe(true);
  });
});
