import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAsync } from './useAsync';

describe('useAsync', () => {
  it('should handle success state', async () => {
    const asyncFn = () => Promise.resolve('data');
    const { result } = renderHook(() => useAsync(asyncFn, false));

    expect(result.current.loading).toBe(false);

    let promise: any;
    act(() => {
      promise = result.current.execute();
    });

    expect(result.current.loading).toBe(true);
    await promise;

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe('data');
    expect(result.current.error).toBeNull();
  });

  it('should handle error state', async () => {
    const error = new Error('fail');
    const asyncFn = () => Promise.reject(error);
    const { result } = renderHook(() => useAsync(asyncFn, false));

    let promise: any;
    act(() => {
      promise = result.current.execute().catch(() => {});
    });

    await promise;

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe(error);
  });
});
