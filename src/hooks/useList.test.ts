import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useList } from './useList';

describe('useList', () => {
  it('should initialize with default list', () => {
    const { result } = renderHook(() => useList([1, 2, 3]));
    expect(result.current.list).toEqual([1, 2, 3]);
  });

  it('should push item', () => {
    const { result } = renderHook(() => useList<number>([]));
    act(() => { result.current.push(1); });
    expect(result.current.list).toEqual([1]);
  });

  it('should remove item at index', () => {
    const { result } = renderHook(() => useList([1, 2, 3]));
    act(() => { result.current.removeAt(1); });
    expect(result.current.list).toEqual([1, 3]);
  });

  it('should clear list', () => {
    const { result } = renderHook(() => useList([1, 2, 3]));
    act(() => { result.current.clear(); });
    expect(result.current.list).toEqual([]);
  });
});
