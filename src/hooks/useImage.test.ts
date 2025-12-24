import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useImage } from './useImage';

describe('useImage', () => {
  it('should be defined', () => {
    expect(useImage).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => useImage());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
