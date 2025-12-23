import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  it('should trigger handler on shortcut', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcuts({ 'ctrl+s': handler }));
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true }));
    });
    expect(handler).toHaveBeenCalled();
  });

  it('should not trigger without modifier', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcuts({ 'ctrl+s': handler }));
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }));
    });
    expect(handler).not.toHaveBeenCalled();
  });
});
