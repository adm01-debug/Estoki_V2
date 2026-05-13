import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useProducts } from './useProducts';

vi.mock('./useCRUD', () => ({
  useCRUD: vi.fn(() => ({
    useList: vi.fn(() => ({ data: { data: [] }, isLoading: false })),
    useGetById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  })),
}));

describe('useProducts', () => {
  it('should be defined', () => {
    expect(useProducts).toBeDefined();
  });

  it('should return products array', () => {
    const { result } = renderHook(() => useProducts());
    expect(Array.isArray(result.current.products)).toBe(true);
  });
});
