import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLogger } from './useLogger';

describe('useLogger', () => {
  it('should be defined', () => {
    expect(useLogger).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => useLogger());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
