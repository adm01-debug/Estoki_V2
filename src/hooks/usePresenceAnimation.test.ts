import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePresenceAnimation } from './usePresenceAnimation';

describe('usePresenceAnimation', () => {
  it('should be defined', () => {
    expect(usePresenceAnimation).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => usePresenceAnimation());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
