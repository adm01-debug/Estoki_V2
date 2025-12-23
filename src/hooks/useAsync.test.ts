import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAsync } from './useAsync';

describe('useAsync', () => {
  it('should handle successful async operation', async () => {
    const asyncFn = vi.fn().mockResolvedValue('success');
    const { result } = renderHook(() => useAsync(asyncFn));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBe('success');
    expect(result.current.error).toBeNull();
  });

  it('should handle error', async () => {
    const asyncFn = vi.fn().mockRejectedValue(new Error('failed'));
    const { result } = renderHook(() => useAsync(asyncFn));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeDefined();
  });
});
