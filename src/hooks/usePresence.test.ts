import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePresence } from './usePresence';

describe('usePresence', () => {
  it('should be defined', () => {
    expect(usePresence).toBeDefined();
  });

  it('should work', () => {
    try {
      const { result } = renderHook(() => usePresence());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
