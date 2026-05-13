import { describe, it, expect } from 'vitest';
import { cycleCountFormSchema } from './cycleCountFormSchema';

describe('cycleCountFormSchema', () => {
  const validItem = {
    productId: 'prod-1',
    productSku: 'SKU-001',
    productName: 'Produto Teste',
    locationId: 'loc-1',
    locationCode: 'LOC-A1',
    systemQuantity: 10,
    countedQuantity: 10,
    variance: 0,
    variancePercentage: 0,
    status: 'pending'
  };

  const validCount = {
    countName: 'Contagem Anual',
    countType: 'full',
    scheduledDate: '2024-12-31',
    items: [validItem],
    blindCount: true,
    varianceThreshold: 2
  };

  it('validates a correct cycle count form data', () => {
    const result = cycleCountFormSchema.safeParse(validCount);
    expect(result.success).toBe(true);
  });

  it('fails if countName is missing', () => {
    const invalid = { ...validCount, countName: '' };
    const result = cycleCountFormSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('fails if scheduledDate is missing', () => {
    const invalid = { ...validCount, scheduledDate: '' };
    const result = cycleCountFormSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('uses default values correctly', () => {
    const minimal = {
      countName: 'Contagem Rápida',
      scheduledDate: '2024-05-20'
    };
    const result = cycleCountFormSchema.safeParse(minimal);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.countType).toBe('full');
      expect(result.data.status).toBe('draft');
      expect(result.data.blindCount).toBe(false);
      expect(result.data.varianceThreshold).toBe(5);
    }
  });
});
