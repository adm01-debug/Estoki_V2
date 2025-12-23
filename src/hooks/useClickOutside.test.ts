import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useClickOutside } from './useClickOutside';

describe('useClickOutside', () => {
  it('should call handler when clicking outside', () => {
    const handler = vi.fn();
    const ref = { current: document.createElement('div') };
    document.body.appendChild(ref.current);
    renderHook(() => useClickOutside(ref, handler));
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    outside.click();
    expect(handler).toHaveBeenCalled();
    document.body.removeChild(ref.current);
    document.body.removeChild(outside);
  });

  it('should not call handler when clicking inside', () => {
    const handler = vi.fn();
    const ref = { current: document.createElement('div') };
    const inside = document.createElement('button');
    ref.current.appendChild(inside);
    document.body.appendChild(ref.current);
    renderHook(() => useClickOutside(ref, handler));
    inside.click();
    expect(handler).not.toHaveBeenCalled();
    document.body.removeChild(ref.current);
  });
});
