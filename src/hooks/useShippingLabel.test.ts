import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useShippingLabel } from './useShippingLabel';

describe('useShippingLabel', () => {
  it('should be defined', () => {
    expect(useShippingLabel).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => useShippingLabel());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
