import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useClipboardAdvanced } from './useClipboardAdvanced';

vi.mock('./use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));

describe('useClipboardAdvanced', () => {
  it('should have copy and paste functions', () => {
    const { result } = renderHook(() => useClipboardAdvanced());
    expect(result.current.copy).toBeDefined();
    expect(result.current.paste).toBeDefined();
    expect(result.current.copied).toBe(false);
  });
});
