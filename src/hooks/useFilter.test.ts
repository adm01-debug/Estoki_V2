import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFilter } from './useFilter';

describe('useFilter', () => {
  const items = [
    { id: 1, name: 'Apple' },
    { id: 2, name: 'Banana' },
    { id: 3, name: 'Cherry' },
  ];

  it('should filter items based on query', () => {
    const { result } = renderHook(() => useFilter(items));

    act(() => {
      result.current.setQuery('apple');
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].name).toBe('Apple');
  });

  it('should use custom filter function if provided', () => {
    const filterFn = (item: any, q: string) => item.id === parseInt(q);
    const { result } = renderHook(() => useFilter(items, filterFn));

    act(() => {
      result.current.setQuery('2');
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].name).toBe('Banana');
  });
});
