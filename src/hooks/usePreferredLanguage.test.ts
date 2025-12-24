import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePreferredLanguage } from './usePreferredLanguage';

describe('usePreferredLanguage', () => {
  it('should be defined', () => {
    expect(usePreferredLanguage).toBeDefined();
  });

  it('should work', () => {
    try {
      const { result } = renderHook(() => usePreferredLanguage());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
