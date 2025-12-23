import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useVibration } from './useVibration';

describe('useVibration', () => {
  it('should have vibration functions', () => {
    const { result } = renderHook(() => useVibration());
    expect(result.current.vibrate).toBeDefined();
    expect(result.current.vibrateSuccess).toBeDefined();
  });
});
