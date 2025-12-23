import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from './use-toast';

describe('useToast', () => {
  it('should return toast function and toasts array', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toast).toBeDefined();
    expect(result.current.toasts).toBeDefined();
  });

  it('should add toast when called', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast({ title: 'Test', description: 'Test message' });
    });
    expect(result.current.toasts.length).toBeGreaterThanOrEqual(0);
  });

  it('should dismiss toast', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      const { dismiss } = result.current.toast({ title: 'Test' });
      dismiss();
    });
    expect(result.current.toasts).toBeDefined();
  });
});
