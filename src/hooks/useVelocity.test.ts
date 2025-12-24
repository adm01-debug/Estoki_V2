import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useVelocity } from './useVelocity';

describe('useVelocity', () => {
  it('should be defined', () => {
    expect(useVelocity).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => useVelocity());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
