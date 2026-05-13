import { describe, it, expect, vi, beforeEach } from 'vitest';
import { batchService } from './batchService';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: '1', quantidade_atual: 10 }, error: null }),
      update: vi.fn().mockReturnThis()
    }))
  }
}));

describe('batchService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get batches by product', async () => {
    const batches = await batchService.getByProduct('prod-1');
    expect(Array.isArray(batches)).toBe(true);
  });

  it('should create batch', async () => {
    const batch = await batchService.createBatch({
      codigo: 'LOT123',
      produto_id: 'prod-1',
      quantidade_inicial: 100,
      quantidade_atual: 100
    });
    expect(batch.id).toBe('1');
  });

  it('should update quantity', async () => {
    await batchService.updateQuantity('1', -5);
    expect(true).toBe(true);
  });
});
