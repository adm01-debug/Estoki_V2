import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFocus } from './useFocus';

describe('useFocus', () => {
  it('should return ref and focus state', () => {
    const { result } = renderHook(() => useFocus());
    expect(result.current.ref).toBeDefined();
    expect(result.current.isFocused).toBe(false);
  });

  it('should track focus state', () => {
    const { result } = renderHook(() => useFocus());
    const input = document.createElement('input');
    document.body.appendChild(input);
    Object.defineProperty(result.current, 'ref', { value: { current: input } });
    act(() => { input.focus(); });
    document.body.removeChild(input);
  });
});
