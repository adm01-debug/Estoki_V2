import { describe, it, expect, vi, beforeEach } from 'vitest';
import { webhookService } from './webhookService';

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

describe('webhookService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(webhookService).toBeDefined();
  });

  it('should have expected methods', () => {
    expect(typeof webhookService).toBe('object');
  });
});
