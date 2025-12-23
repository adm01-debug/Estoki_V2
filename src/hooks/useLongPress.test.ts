import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLongPress } from './useLongPress';

describe('useLongPress', () => {
  it('should have handlers', () => {
    const { result } = renderHook(() => useLongPress(vi.fn()));
    expect(result.current.handlers.onMouseDown).toBeDefined();
  });
});
