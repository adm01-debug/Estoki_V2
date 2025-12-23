import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClipboard } from './useClipboard';

describe('useClipboard', () => {
  const mockClipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
  Object.assign(navigator, { clipboard: mockClipboard });

  it('should copy text to clipboard', async () => {
    const { result } = renderHook(() => useClipboard());
    await act(async () => { await result.current.copy('test text'); });
    expect(mockClipboard.writeText).toHaveBeenCalledWith('test text');
    expect(result.current.copied).toBe(true);
  });
});
