import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePageVisibility } from './usePageVisibility';
describe('usePageVisibility', () => {
  it('should return visibility', () => {
    const { result } = renderHook(() => usePageVisibility());
    expect(typeof result.current).toBe('boolean');
  });
});
