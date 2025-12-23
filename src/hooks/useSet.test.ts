import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSet } from './useSet';

describe('useSet', () => {
  it('should initialize with values', () => {
    const { result } = renderHook(() => useSet<number>([1, 2, 3]));
    expect(result.current.set.has(1)).toBe(true);
  });

  it('should add value', () => {
    const { result } = renderHook(() => useSet<number>());
    act(() => { result.current.add(42); });
    expect(result.current.set.has(42)).toBe(true);
  });

  it('should remove value', () => {
    const { result } = renderHook(() => useSet<number>([1, 2]));
    act(() => { result.current.remove(1); });
    expect(result.current.set.has(1)).toBe(false);
  });

  it('should toggle value', () => {
    const { result } = renderHook(() => useSet<number>([1]));
    act(() => { result.current.toggle(1); });
    expect(result.current.set.has(1)).toBe(false);
    act(() => { result.current.toggle(1); });
    expect(result.current.set.has(1)).toBe(true);
  });
});
