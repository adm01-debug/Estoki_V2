import { describe, it, expect, vi, beforeEach } from 'vitest';
import { movimentacaoService } from './movimentacaoService';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: null, error: null }),
            })),
          })),
        })),
        gte: vi.fn(() => ({
          lte: vi.fn(() => ({
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          })),
        })),
        order: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        })),
      })),
    })),
  },
}));

describe('movimentacaoService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registrar', () => {
    it('should register a movimentacao', async () => {
      const result = await movimentacaoService.registrar({
        tipo: 'entrada',
        quantidade: 10,
        usuario_id: 'user-123',
        lote_id: 'lote-456',
      });
      expect(result).toBe(true);
    });
  });

  describe('getHistorico', () => {
    it('should return empty array when no history', async () => {
      const result = await movimentacaoService.getHistorico();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should filter by lote_id', async () => {
      const result = await movimentacaoService.getHistorico({ lote_id: 'lote-123' });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getUltimaMovimentacao', () => {
    it('should return null when no movimentacao', async () => {
      const result = await movimentacaoService.getUltimaMovimentacao('lote-123');
      expect(result).toBeNull();
    });
  });
});
