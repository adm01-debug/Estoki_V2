import { describe, it, expect } from 'vitest';
import { inventoryFormSchema } from './inventoryFormSchema';

describe('inventoryFormSchema', () => {
  it('validates correct inventory adjustment', () => {
    const data = {
      adjustmentType: 'correction',
      items: [
        {
          productId: 'p1',
          productSku: 's1',
          locationId: 'l1',
          currentQuantity: 10,
          newQuantity: 12,
          adjustmentQuantity: 2,
          reason: 'Stock correction'
        }
      ]
    };
    const result = inventoryFormSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});
