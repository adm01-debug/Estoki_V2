import { renderHook } from '@testing-library/react';
import { useFIFO } from './useFIFO';
import { describe, it, expect } from 'vitest';

describe('useFIFO', () => {
  const mockInventory = [
    { id: '1', sku: 'SKU1', quantity: 10, receivedAt: new Date('2023-01-01') },
    { id: '2', sku: 'SKU1', quantity: 5, receivedAt: new Date('2023-01-02') },
    { id: '3', sku: 'SKU2', quantity: 20, receivedAt: new Date('2023-01-01') },
  ];

  it('should sort inventory by receivedAt date (FIFO principle)', () => {
    const { result } = renderHook(() => useFIFO(mockInventory));
    expect(result.current.sorted[0].id).toBe('1');
    expect(result.current.sorted[1].id).toBe('3');
    expect(result.current.sorted[2].id).toBe('2');
  });

  it('should correctly pick items based on FIFO', () => {
    const { result } = renderHook(() => useFIFO(mockInventory));
    
    const pickResult = result.current.pick('SKU1', 12);
    
    expect(pickResult.picks).toHaveLength(2);
    expect(pickResult.picks[0]).toEqual({ id: '1', quantity: 10 });
    expect(pickResult.picks[1]).toEqual({ id: '2', quantity: 2 });
    expect(pickResult.unfulfilled).toBe(0);
  });

  it('should return unfulfilled quantity if inventory is insufficient', () => {
    const { result } = renderHook(() => useFIFO(mockInventory));
    
    const pickResult = result.current.pick('SKU1', 20);
    
    expect(pickResult.picks).toHaveLength(2);
    expect(pickResult.unfulfilled).toBe(5);
  });

  it('should get the oldest item for a specific SKU', () => {
    const { result } = renderHook(() => useFIFO(mockInventory));
    
    const oldest = result.current.getOldest('SKU1');
    expect(oldest?.id).toBe('1');
  });

  it('should handle empty inventory gracefully', () => {
    const { result } = renderHook(() => useFIFO([]));
    expect(result.current.sorted).toEqual([]);
    expect(result.current.pick('ANY', 10).unfulfilled).toBe(10);
    expect(result.current.getOldest('ANY')).toBeUndefined();
  });
});
