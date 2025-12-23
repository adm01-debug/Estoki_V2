import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOffline } from './useOffline';

describe('useOffline', () => {
  it('should start as online', () => {
    const { result } = renderHook(() => useOffline());
    expect(result.current.isOnline).toBe(true);
  });

  it('should queue actions', () => {
    const { result } = renderHook(() => useOffline());
    act(() => {
      result.current.queueAction('CREATE', { data: 'test' });
    });
    expect(result.current.pendingActions).toHaveLength(1);
  });
});
