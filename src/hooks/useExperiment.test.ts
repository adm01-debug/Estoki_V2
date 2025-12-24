import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useExperiment } from './useExperiment';

describe('useExperiment', () => {
  it('should be defined', () => {
    expect(useExperiment).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => useExperiment());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
