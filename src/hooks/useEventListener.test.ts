import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEventListener } from './useEventListener';

describe('useEventListener', () => {
  it('should add event listener to window', () => {
    const handler = vi.fn();
    renderHook(() => useEventListener('click', handler));
    window.dispatchEvent(new Event('click'));
    expect(handler).toHaveBeenCalled();
  });

  it('should remove listener on unmount', () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useEventListener('click', handler));
    unmount();
    window.dispatchEvent(new Event('click'));
    expect(handler).toHaveBeenCalledTimes(0);
  });
});
