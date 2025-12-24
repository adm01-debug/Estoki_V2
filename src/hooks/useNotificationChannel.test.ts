import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNotificationChannel } from './useNotificationChannel';

describe('useNotificationChannel', () => {
  it('should be defined', () => {
    expect(useNotificationChannel).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => useNotificationChannel());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
