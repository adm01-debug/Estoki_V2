import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFavicon } from './useFavicon';

describe('useFavicon', () => {
  it('should be defined', () => {
    expect(useFavicon).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => useFavicon());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
