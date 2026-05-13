import { describe, it, expect } from 'vitest';
import { shipmentFormSchema } from './shipmentFormSchema';

describe('shipmentFormSchema', () => {
  it('validates correct shipment form', () => {
    const data = {
      orderId: 'o1',
      orderNumber: 'ORD-01',
      carrierId: 'c1',
      serviceType: 'express',
      shippingAddress: {
        name: 'John Doe',
        street: 'Main St',
        number: '123',
        neighborhood: 'Central',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01001000'
      },
      packages: [{ packageNumber: 'p1', weight: 1.2 }],
      totalWeight: 1.2
    };
    const result = shipmentFormSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});
