import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('should start at initial value', () => {
    const { result } = renderHook(() => useCounter(5));
    expect(result.current.count).toBe(5);
  });

  it('should increment', () => {
    const { result } = renderHook(() => useCounter(0));
    act(() => { result.current.increment(); });
    expect(result.current.count).toBe(1);
  });

  it('should decrement', () => {
    const { result } = renderHook(() => useCounter(5));
    act(() => { result.current.decrement(); });
    expect(result.current.count).toBe(4);
  });

  it('should reset to initial', () => {
    const { result } = renderHook(() => useCounter(10));
    act(() => { result.current.increment(); });
    act(() => { result.current.reset(); });
    expect(result.current.count).toBe(10);
  });
});
