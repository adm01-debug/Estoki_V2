import { renderHook, act } from '@testing-library/react';
import { useInventoryCount } from './useInventoryCount';
import { describe, it, expect } from 'vitest';

describe('useInventoryCount', () => {
  it('should initialize with empty items', () => {
    const { result } = renderHook(() => useInventoryCount());
    expect(result.current.items).toEqual([]);
    expect(result.current.isComplete).toBe(false);
  });

  it('should add a count item', () => {
    const { result } = renderHook(() => useInventoryCount());
    act(() => {
      result.current.addCount('SKU1', 10, 8);
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toEqual({
      sku: 'SKU1',
      expected: 10,
      counted: 8,
      variance: -2
    });
  });

  it('should update an existing count', () => {
    const { result } = renderHook(() => useInventoryCount());
    act(() => {
      result.current.addCount('SKU1', 10, 8);
    });
    act(() => {
      result.current.updateCount('SKU1', 10);
    });
    expect(result.current.items[0].counted).toBe(10);
    expect(result.current.items[0].variance).toBe(0);
  });

  it('should calculate total variance', () => {
    const { result } = renderHook(() => useInventoryCount());
    act(() => {
      result.current.addCount('SKU1', 10, 8);
      result.current.addCount('SKU2', 5, 7);
    });
    expect(result.current.getTotalVariance()).toBe(0); // -2 + 2
  });

  it('should calculate accuracy correctly', () => {
    const { result } = renderHook(() => useInventoryCount());
    act(() => {
      result.current.addCount('SKU1', 10, 10); // Matched
      result.current.addCount('SKU2', 10, 8);  // Not matched
    });
    // Total expected: 20, Matched expected: 10
    expect(result.current.getAccuracy()).toBe(50);
  });

  it('should clear items', () => {
    const { result } = renderHook(() => useInventoryCount());
    act(() => {
      result.current.addCount('SKU1', 10, 10);
      result.current.clear();
    });
    expect(result.current.items).toEqual([]);
  });
});
