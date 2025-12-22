import { describe, it, expect, vi, beforeEach } from 'vitest';
import { relatorioService } from './relatorioService';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        gte: vi.fn(() => ({
          lte: vi.fn().mockResolvedValue({ data: [], error: null }),
        })),
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      })),
    })),
  },
}));

describe('relatorioService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getRelatorioTriagem', () => {
    it('should return triagem report', async () => {
      const result = await relatorioService.getRelatorioTriagem('2024-01-01', '2024-12-31');
      expect(result).toBeDefined();
    });
  });

  describe('getRelatorioEstoque', () => {
    it('should return estoque report', async () => {
      const result = await relatorioService.getRelatorioEstoque();
      expect(result).toBeDefined();
    });
  });

  describe('getRelatorioMovimentacao', () => {
    it('should return movimentacao report', async () => {
      const result = await relatorioService.getRelatorioMovimentacao('2024-01-01', '2024-12-31');
      expect(result).toBeDefined();
    });
  });
});
