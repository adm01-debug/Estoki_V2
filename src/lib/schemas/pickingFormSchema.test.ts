import { describe, it, expect } from 'vitest';
import { pickingFormSchema } from './pickingFormSchema';

describe('pickingFormSchema', () => {
  it('validates a correct picking form', () => {
    const data = {
      orderId: 'order-123',
      orderNumber: 'ORD-2024-001',
      items: [
        {
          productId: 'prod-1',
          productSku: 'SKU-1',
          productName: 'Product 1',
          quantityRequested: 10,
          quantityPicked: 0,
          locationId: 'loc-1',
          locationCode: 'A-01-01',
        }
      ]
    };
    const result = pickingFormSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('fails if orderId is missing', () => {
    const data = { orderNumber: 'ORD-1', items: [] };
    const result = pickingFormSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
