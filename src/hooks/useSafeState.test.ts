import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSafeState } from './useSafeState';
describe('useSafeState', () => {
  it('should update state safely', () => {
    const { result } = renderHook(() => useSafeState(0));
    act(() => result.current[1](1));
    expect(result.current[0]).toBe(1);
  });
});
