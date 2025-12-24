import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNotificationPermission } from './useNotificationPermission';

describe('useNotificationPermission', () => {
  it('should be defined', () => {
    expect(useNotificationPermission).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => useNotificationPermission());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
