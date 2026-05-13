import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useStock } from './useStock';

vi.mock('./useCRUD', () => ({
  useCRUD: vi.fn(() => ({
    useList: vi.fn(() => ({ data: { data: [] }, isLoading: false })),
    useGetById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  })),
}));

describe('useStock', () => {
  it('should be defined', () => {
    expect(useStock).toBeDefined();
  });

  it('should return movements array', () => {
    const { result } = renderHook(() => useStock());
    expect(Array.isArray(result.current.movements)).toBe(true);
  });
});
