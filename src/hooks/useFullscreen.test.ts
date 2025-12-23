import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFullscreen } from './useFullscreen';

describe('useFullscreen', () => {
  it('should start not fullscreen', () => {
    const { result } = renderHook(() => useFullscreen());
    expect(result.current.isFullscreen).toBe(false);
  });
});
