import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useHover } from './useHover';

describe('useHover', () => {
  it('should start not hovered', () => {
    const { result } = renderHook(() => useHover());
    expect(result.current[1]).toBe(false);
  });
});
