import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSort } from './useSort';

describe('useSort', () => {
  const items = [{ name: 'C', value: 3 }, { name: 'A', value: 1 }, { name: 'B', value: 2 }];

  it('should return unsorted items initially', () => {
    const { result } = renderHook(() => useSort(items));
    expect(result.current.sortedItems).toEqual(items);
  });

  it('should sort by key ascending', () => {
    const { result } = renderHook(() => useSort(items));
    act(() => { result.current.sortBy('name'); });
    expect(result.current.sortedItems[0].name).toBe('A');
  });

  it('should toggle sort direction', () => {
    const { result } = renderHook(() => useSort(items));
    act(() => { result.current.sortBy('name'); });
    act(() => { result.current.sortBy('name'); });
    expect(result.current.sortedItems[0].name).toBe('C');
  });
});
