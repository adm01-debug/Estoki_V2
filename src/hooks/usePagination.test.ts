import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePagination } from './usePagination';

describe('usePagination', () => {
  const items = Array.from({ length: 25 }, (_, i) => i + 1);

  it('should paginate items correctly', () => {
    const { result } = renderHook(() => usePagination(items, 10));

    expect(result.current.items).toHaveLength(10);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.currentPage).toBe(1);

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.items[0]).toBe(11);

    act(() => {
      result.current.goToPage(3);
    });

    expect(result.current.currentPage).toBe(3);
    expect(result.current.items).toHaveLength(5);
  });
});
