import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStack } from './useStack';

describe('useStack', () => {
  it('should push and pop', () => {
    const { result } = renderHook(() => useStack<number>());
    act(() => { result.current.push(1); result.current.push(2); });
    expect(result.current.size).toBe(2);
    act(() => { result.current.pop(); });
    expect(result.current.size).toBe(1);
  });
});
