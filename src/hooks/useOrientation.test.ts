import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useOrientation } from './useOrientation';

describe('useOrientation', () => {
  it('should return orientation', () => {
    const { result } = renderHook(() => useOrientation());
    expect(['portrait', 'landscape']).toContain(result.current);
  });
});
