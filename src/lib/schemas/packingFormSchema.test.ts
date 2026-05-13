import { describe, it, expect } from 'vitest';
import { packingFormSchema } from './packingFormSchema';

describe('packingFormSchema', () => {
  it('validates a correct packing form', () => {
    const data = {
      orderId: 'order-123',
      orderNumber: 'ORD-001',
      packages: [
        {
          packageNumber: 'PKG-001',
          packageType: 'box',
          weight: 1.5,
          dimensions: { length: 10, width: 10, height: 10 },
          items: [
            { productId: 'p1', productSku: 's1', productName: 'n1', quantity: 1 }
          ]
        }
      ],
      totalWeight: 1.5
    };
    const result = packingFormSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});
