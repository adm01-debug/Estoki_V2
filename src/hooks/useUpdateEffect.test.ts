import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUpdateEffect } from './useUpdateEffect';
describe('useUpdateEffect', () => {
  it('should not run on first render', () => {
    const effect = vi.fn();
    renderHook(() => useUpdateEffect(effect, []));
    expect(effect).not.toHaveBeenCalled();
  });
});
