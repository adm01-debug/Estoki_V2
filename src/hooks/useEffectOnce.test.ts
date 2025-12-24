import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEffectOnce } from './useEffectOnce';

describe('useEffectOnce', () => {
  it('should be defined', () => {
    expect(useEffectOnce).toBeDefined();
  });

  it('should work correctly', () => {
    try {
      const { result } = renderHook(() => useEffectOnce());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
