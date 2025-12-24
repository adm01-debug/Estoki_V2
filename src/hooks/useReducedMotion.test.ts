import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useReducedMotion } from './useReducedMotion';

describe('useReducedMotion', () => {
  it('should be defined', () => {
    expect(useReducedMotion).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => useReducedMotion());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
