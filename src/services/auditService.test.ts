import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auditService } from './auditService';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
      then: vi.fn((cb) => Promise.resolve(cb({ data: [], error: null }))),
    })),
    rpc: vi.fn().mockResolvedValue({ data: 'log-id', error: null }),
  },
}));

describe('auditService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('log', () => {
    it('should log an audit entry', async () => {
      const result = await auditService.log('test_action', 'test_entity', '123');
      expect(result).toBe('log-id');
    });
  });

  describe('getLogs', () => {
    it('should fetch logs with default filters', async () => {
      const result = await auditService.getLogs();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getByEntity', () => {
    it('should return empty array when no logs found', async () => {
      const result = await auditService.getByEntity('test_entity', '123');
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
