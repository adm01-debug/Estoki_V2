import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auditService } from './auditService';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn(() => ({
        ilike: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        })),
        order: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        })),
      })),
    })),
  },
}));

describe('auditService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('log', () => {
    it('should log an audit entry', async () => {
      await auditService.log({
        user_id: 'user-123',
        action: 'CREATE',
        entity_type: 'produto',
        entity_id: 'prod-456',
      });
      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('getByEntity', () => {
    it('should return empty array when no logs found', async () => {
      const result = await auditService.getByEntity('produto', 'prod-456');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getByUser', () => {
    it('should return empty array when no logs found', async () => {
      const result = await auditService.getByUser('user-123');
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
