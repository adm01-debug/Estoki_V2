import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shippingService } from './shippingService';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    })),
  },
}));

describe('shippingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch romaneios successfully', async () => {
    const mockData = [
      { id: '1', codigo: 'ROM-1', status: 'rascunho', romaneio_itens: [] },
    ];

    (supabase.from as any).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    }));

    const result = await shippingService.getRomaneios();
    expect(result).toHaveLength(1);
    expect(result[0].codigo).toBe('ROM-1');
  });

  it('should handle errors when fetching romaneios', async () => {
    (supabase.from as any).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: new Error('DB Error') }),
    }));

    await expect(shippingService.getRomaneios()).rejects.toThrow('DB Error');
  });

  it('should create a new romaneio', async () => {
    const input = {
      motorista: 'João',
      placa_veiculo: 'ABC-1234',
      tipo_veiculo: 'Caminhão',
    };

    (supabase.from as any).mockImplementation(() => ({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'new-id', ...input }, error: null }),
    }));

    const result = await shippingService.criarRomaneio(input as any);
    expect(result.id).toBe('new-id');
    expect(supabase.from).toHaveBeenCalledWith('romaneios');
  });
});
