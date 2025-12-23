import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScrollPosition } from './useScrollPosition';

describe('useScrollPosition', () => {
  it('should return initial scroll position', () => {
    const { result } = renderHook(() => useScrollPosition());
    expect(result.current.x).toBeDefined();
    expect(result.current.y).toBeDefined();
  });

  it('should update on scroll', () => {
    const { result } = renderHook(() => useScrollPosition());
    act(() => {
      Object.defineProperty(window, 'scrollX', { value: 100, writable: true });
      Object.defineProperty(window, 'scrollY', { value: 200, writable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current.x).toBe(100);
    expect(result.current.y).toBe(200);
  });
});
