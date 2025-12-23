import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUndo } from './useUndo';

describe('useUndo', () => {
  it('should undo and redo', () => {
    const { result } = renderHook(() => useUndo(0));
    act(() => { result.current.set(1); });
    expect(result.current.state).toBe(1);
    act(() => { result.current.undo(); });
    expect(result.current.state).toBe(0);
    act(() => { result.current.redo(); });
    expect(result.current.state).toBe(1);
  });
});
