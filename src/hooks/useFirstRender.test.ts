import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFirstRender } from './useFirstRender';
describe('useFirstRender', () => {
  it('should return true on first render', () => {
    const { result, rerender } = renderHook(() => useFirstRender());
    expect(result.current).toBe(true);
    rerender();
    expect(result.current).toBe(false);
  });
});
