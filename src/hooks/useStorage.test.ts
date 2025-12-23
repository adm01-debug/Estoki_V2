import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStorage } from './useStorage';

describe('useStorage', () => {
  it('should return initial value', () => {
    const { result } = renderHook(() => useStorage('test', 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  it('should update value', () => {
    const { result } = renderHook(() => useStorage('test2', 0));
    act(() => { result.current[1](5); });
    expect(result.current[0]).toBe(5);
  });
});
