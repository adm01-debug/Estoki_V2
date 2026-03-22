import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useThrottledValue } from './useThrottle';

describe('useThrottledValue', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('should return initial value', () => {
    const { result } = renderHook(() => useThrottledValue('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should throttle value updates', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottledValue(value, 500),
      { initialProps: { value: 'a' } }
    );
    expect(result.current).toBe('a');
    rerender({ value: 'b' });
    act(() => { vi.advanceTimersByTime(500); });
    expect(result.current).toBe('b');
  });
});
