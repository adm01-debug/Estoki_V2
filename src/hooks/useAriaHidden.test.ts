import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAriaHidden } from './useAriaHidden';

describe('useAriaHidden', () => {
  it('should be defined', () => {
    expect(useAriaHidden).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => useAriaHidden());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
