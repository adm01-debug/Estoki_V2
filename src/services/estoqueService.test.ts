import { describe, it, expect, vi } from 'vitest';
import { estoqueService } from './estoqueService';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: '1' }, error: null }),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    }))
  }
}));

describe('estoqueService', () => {
  it('should get all estoque items', async () => {
    const result = await estoqueService.getAll();
    expect(result).toBeDefined();
  });

  it('should get estoque by id', async () => {
    const result = await estoqueService.getById('1');
    expect(result).toBeDefined();
  });
});
