import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

vi.mock('react-router-dom', () => ({ useNavigate: () => vi.fn() }));

describe('useKeyboardShortcuts', () => {
  it('should initialize without errors', () => {
    const { result } = renderHook(() => useKeyboardShortcuts());
    expect(result).toBeDefined();
  });
});
