import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useQuery } from './useQuery';

describe('useQuery', () => {
  it('should fetch data successfully', async () => {
    const fetcher = vi.fn().mockResolvedValue({ data: 'test' });
    const { result } = renderHook(() => useQuery('test-key', fetcher));
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual({ data: 'test' });
  });

  it('should handle fetch error', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('Fetch failed'));
    const { result } = renderHook(() => useQuery('error-key', fetcher));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeDefined();
  });
});
