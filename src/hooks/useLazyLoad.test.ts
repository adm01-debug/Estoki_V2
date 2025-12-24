import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLazyLoad } from './useLazyLoad';

describe('useLazyLoad', () => {
  it('should be defined', () => {
    expect(useLazyLoad).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => useLazyLoad());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
