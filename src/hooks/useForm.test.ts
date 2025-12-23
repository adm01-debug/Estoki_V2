import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useForm } from './useForm';

describe('useForm', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useForm({ name: '', email: '' }));
    expect(result.current.values).toEqual({ name: '', email: '' });
  });

  it('should update field value', () => {
    const { result } = renderHook(() => useForm({ name: '' }));
    act(() => { result.current.handleChange({ target: { name: 'name', value: 'John' } } as any); });
    expect(result.current.values.name).toBe('John');
  });

  it('should reset form', () => {
    const { result } = renderHook(() => useForm({ name: '' }));
    act(() => { result.current.handleChange({ target: { name: 'name', value: 'John' } } as any); });
    act(() => { result.current.reset(); });
    expect(result.current.values.name).toBe('');
  });
});
