import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });

  it('should return initial value when no stored value', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('should store value in localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    act(() => { result.current[1]('updated'); });
    expect(result.current[0]).toBe('updated');
    expect(JSON.parse(localStorage.getItem('test-key') || '')).toBe('updated');
  });

  it('should read existing value from localStorage', () => {
    localStorage.setItem('existing-key', JSON.stringify('stored-value'));
    const { result } = renderHook(() => useLocalStorage('existing-key', 'default'));
    expect(result.current[0]).toBe('stored-value');
  });
});
