import { describe, it, expect, vi, beforeEach } from 'vitest';
import { permissionService } from './permissionService';

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

describe('permissionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(permissionService).toBeDefined();
  });

  it('should have expected methods', () => {
    expect(typeof permissionService).toBe('object');
  });
});
