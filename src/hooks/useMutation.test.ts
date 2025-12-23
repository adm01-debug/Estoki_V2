import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMutation } from './useMutation';

describe('useMutation', () => {
  it('should execute mutation successfully', async () => {
    const mutationFn = vi.fn().mockResolvedValue({ success: true });
    const { result } = renderHook(() => useMutation(mutationFn));
    act(() => { result.current.mutate({ data: 'test' }); });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual({ success: true });
  });

  it('should handle mutation error', async () => {
    const mutationFn = vi.fn().mockRejectedValue(new Error('Failed'));
    const { result } = renderHook(() => useMutation(mutationFn));
    act(() => { result.current.mutate({ data: 'test' }); });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeDefined();
  });
});
