import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useOrders } from './useOrders';

vi.mock('./useCRUD', () => ({
  useCRUD: vi.fn(() => ({
    useList: vi.fn(() => ({ data: { data: [] }, isLoading: false })),
    useGetById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  })),
}));

describe('useOrders', () => {
  it('should be defined', () => {
    expect(useOrders).toBeDefined();
  });

  it('should return orders array', () => {
    const { result } = renderHook(() => useOrders());
    expect(Array.isArray(result.current.orders)).toBe(true);
  });
});
