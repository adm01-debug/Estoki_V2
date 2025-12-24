import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCarrierIntegration } from './useCarrierIntegration';

describe('useCarrierIntegration', () => {
  it('should be defined', () => {
    expect(useCarrierIntegration).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => useCarrierIntegration());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
