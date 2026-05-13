import { describe, it, expect, vi, beforeEach } from 'vitest';
import { abcService } from './abcService';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      gt: vi.fn().mockResolvedValue({
        data: [
          {
            quantidade_atual: 10,
            produto: { id: '1', nome: 'Prod A', sku: 'SKU1', preco_venda: 100 }
          },
          {
            quantidade_atual: 5,
            produto: { id: '2', nome: 'Prod B', sku: 'SKU2', preco_venda: 50 }
          }
        ],
        error: null
      })
    }))
  }
}));

describe('abcService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should calculate ABC analysis correctly', async () => {
    const result = await abcService.getAnalysis();
    expect(result).toHaveLength(2);
    expect(result[0].classe).toBe('A');
    expect(result[0].valorTotal).toBe(1000);
    expect(result[1].valorTotal).toBe(250);
  });
});
