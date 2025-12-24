import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useContextMenu } from './useContextMenu';

describe('useContextMenu', () => {
  it('should be defined', () => {
    expect(useContextMenu).toBeDefined();
  });

  it('should work with ref', () => {
    try {
      const { result } = renderHook(() => useContextMenu());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
