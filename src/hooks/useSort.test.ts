import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSort } from './useSort';

describe('useSort', () => {
  const items = [
    { id: 1, name: 'C' },
    { id: 2, name: 'A' },
    { id: 3, name: 'B' },
  ];

  it('should sort items in ascending order by default', () => {
    const { result } = renderHook(() => useSort(items));

    act(() => {
      result.current.requestSort('name');
    });

    expect(result.current.items[0].name).toBe('A');
    expect(result.current.items[1].name).toBe('B');
    expect(result.current.items[2].name).toBe('C');
  });

  it('should toggle sort direction', () => {
    const { result } = renderHook(() => useSort(items));

    act(() => {
      result.current.requestSort('name'); // asc
    });
    expect(result.current.items[0].name).toBe('A');

    act(() => {
      result.current.requestSort('name'); // desc
    });
    expect(result.current.items[0].name).toBe('C');
  });
});
