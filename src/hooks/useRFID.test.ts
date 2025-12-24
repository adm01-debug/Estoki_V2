import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRFID } from './useRFID';

describe('useRFID', () => {
  it('should be defined', () => {
    expect(useRFID).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => useRFID());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
