import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQueue } from './useQueue';

describe('useQueue', () => {
  it('should start empty', () => {
    const { result } = renderHook(() => useQueue());
    expect(result.current.isEmpty).toBe(true);
  });

  it('should enqueue items', () => {
    const { result } = renderHook(() => useQueue<number>());
    act(() => { result.current.enqueue(1); });
    expect(result.current.size).toBe(1);
  });
});
