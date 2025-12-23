import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCountdown } from './useCountdown';

describe('useCountdown', () => {
  it('should initialize with seconds', () => {
    const { result } = renderHook(() => useCountdown(60));
    expect(result.current.seconds).toBe(60);
    expect(result.current.isRunning).toBe(false);
  });
});
