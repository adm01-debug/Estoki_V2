import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSound } from './useSound';

describe('useSound', () => {
  it('should have sound functions', () => {
    const { result } = renderHook(() => useSound());
    expect(result.current.play).toBeDefined();
    expect(result.current.playSuccess).toBeDefined();
    expect(result.current.playError).toBeDefined();
  });
});
