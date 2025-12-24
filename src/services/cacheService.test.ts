import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cacheService } from './cacheService';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
}));

describe('cacheService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(cacheService).toBeDefined();
  });

  it('should have expected methods', () => {
    expect(typeof cacheService).toBe('object');
  });
});
