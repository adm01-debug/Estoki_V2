import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useClickOutside } from './useClickOutside';

describe('useClickOutside', () => {
  it('should call handler when clicking outside', () => {
    const handler = vi.fn();
    const { result } = renderHook(() => useClickOutside(handler));
    
    // Create a mock element
    const element = document.createElement('div');
    Object.defineProperty(result.current, 'current', { value: element });

    // Click inside
    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(handler).not.toHaveBeenCalled();

    // Click outside
    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(handler).toHaveBeenCalled();
  });
});
