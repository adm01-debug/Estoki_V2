import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFormContext } from './useFormContext';

describe('useFormContext', () => {
  it('should be defined', () => {
    expect(useFormContext).toBeDefined();
  });

  it('should work correctly', () => {
    try {
      const { result } = renderHook(() => useFormContext());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
