import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePagination } from './usePagination';

describe('usePagination', () => {
  it('should initialize with first page', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 100, itemsPerPage: 10 }));
    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(10);
  });

  it('should go to next page', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 100, itemsPerPage: 10 }));
    act(() => { result.current.nextPage(); });
    expect(result.current.currentPage).toBe(2);
  });

  it('should go to previous page', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 100, itemsPerPage: 10, initialPage: 5 }));
    act(() => { result.current.prevPage(); });
    expect(result.current.currentPage).toBe(4);
  });

  it('should not exceed bounds', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 20, itemsPerPage: 10 }));
    act(() => { result.current.goToPage(5); });
    expect(result.current.currentPage).toBe(2);
  });
});
