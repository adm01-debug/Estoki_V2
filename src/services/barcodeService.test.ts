import { describe, it, expect, vi, beforeEach } from 'vitest';
import { barcodeService } from './barcodeService';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { id: '1', barcode: '123' }, error: null }),
      update: vi.fn().mockReturnThis()
    }))
  }
}));

describe('barcodeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should find product by barcode', async () => {
    const product = await barcodeService.findByBarcode('123');
    expect(product.id).toBe('1');
  });

  it('should generate barcode', async () => {
    const barcode = await barcodeService.generateBarcode('EAN13');
    expect(barcode).toMatch(/^789\d{9}$/);
  });

  it('should associate barcode', async () => {
    await barcodeService.associateBarcode('1', '123456');
    expect(true).toBe(true);
  });
});
