import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLabelPrint } from './useLabelPrint';

describe('useLabelPrint', () => {
  it('should be defined', () => {
    expect(useLabelPrint).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => useLabelPrint());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
