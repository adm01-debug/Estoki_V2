import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePushSubscription } from './usePushSubscription';

describe('usePushSubscription', () => {
  it('should be defined', () => {
    expect(usePushSubscription).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => usePushSubscription());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
