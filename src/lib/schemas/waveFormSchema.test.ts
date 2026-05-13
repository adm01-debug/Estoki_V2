import { describe, it, expect } from 'vitest';
import { waveFormSchema } from './waveFormSchema';

describe('waveFormSchema', () => {
  const validOrder = {
    orderId: 'ord-123',
    orderNumber: 'PED-001',
    priority: 'high',
    itemCount: 2,
    totalQuantity: 10
  };

  const validWave = {
    waveName: 'Wave Matutina',
    waveType: 'manual',
    orders: [validOrder],
    priority: 'high',
    pickingStrategy: 'zone'
  };

  it('validates a correct wave form data', () => {
    const result = waveFormSchema.safeParse(validWave);
    expect(result.success).toBe(true);
  });

  it('fails if waveName is missing', () => {
    const invalidWave = { ...validWave, waveName: '' };
    const result = waveFormSchema.safeParse(invalidWave);
    expect(result.success).toBe(false);
  });

  it('fails if orders list is empty', () => {
    const invalidWave = { ...validWave, orders: [] };
    const result = waveFormSchema.safeParse(invalidWave);
    expect(result.success).toBe(false);
  });

  it('uses default values correctly', () => {
    const minimalWave = {
      waveName: 'Wave Teste',
      orders: [validOrder]
    };
    const result = waveFormSchema.safeParse(minimalWave);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.waveType).toBe('manual');
      expect(result.data.status).toBe('draft');
      expect(result.data.pickingStrategy).toBe('fifo');
    }
  });
});
