import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from './use-keyboard-shortcuts';

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call handler when shortcut is pressed', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcuts([
      { key: 's', modifiers: ['ctrl'], handler }
    ]));

    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true
    });

    window.dispatchEvent(event);
    expect(handler).toHaveBeenCalled();
  });

  it('should not call handler if disabled', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcuts([
      { key: 's', modifiers: ['ctrl'], handler, enabled: false }
    ]));

    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true
    });

    window.dispatchEvent(event);
    expect(handler).not.toHaveBeenCalled();
  });

  it('should respect modifiers', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcuts([
      { key: 's', modifiers: ['ctrl', 'shift'], handler }
    ]));

    // Press only ctrl+s (missing shift)
    const event1 = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      shiftKey: false,
      bubbles: true
    });
    window.dispatchEvent(event1);
    expect(handler).not.toHaveBeenCalled();

    // Press ctrl+shift+s
    const event2 = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true
    });
    window.dispatchEvent(event2);
    expect(handler).toHaveBeenCalled();
  });

  it('should ignore shortcuts when typing in inputs', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcuts([
      { key: 's', modifiers: ['ctrl'], handler }
    ]));

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true
    });

    input.dispatchEvent(event);
    expect(handler).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });
});
