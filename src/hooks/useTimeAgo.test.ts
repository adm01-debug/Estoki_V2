import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTimeAgo } from './useTimeAgo';

describe('useTimeAgo', () => {
  it('should return time ago', () => {
    const { result } = renderHook(() => useTimeAgo(new Date()));
    expect(result.current).toBe('agora');
  });
});
