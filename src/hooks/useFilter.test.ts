import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFilter } from './useFilter';

describe('useFilter', () => {
  const items = [{ name: 'Apple', type: 'fruit' }, { name: 'Carrot', type: 'vegetable' }, { name: 'Banana', type: 'fruit' }];

  it('should return all items when no filter', () => {
    const { result } = renderHook(() => useFilter(items));
    expect(result.current.filteredItems).toHaveLength(3);
  });

  it('should filter by predicate', () => {
    const { result } = renderHook(() => useFilter(items));
    act(() => { result.current.setFilter((item) => item.type === 'fruit'); });
    expect(result.current.filteredItems).toHaveLength(2);
  });

  it('should clear filter', () => {
    const { result } = renderHook(() => useFilter(items));
    act(() => { result.current.setFilter((item) => item.type === 'fruit'); });
    act(() => { result.current.clearFilter(); });
    expect(result.current.filteredItems).toHaveLength(3);
  });
});
