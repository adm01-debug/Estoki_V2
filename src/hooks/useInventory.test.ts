import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useInventory } from './useInventory';

vi.mock('./useCRUD', () => ({
  useCRUD: vi.fn(() => ({
    useList: vi.fn(() => ({ data: { data: [] }, isLoading: false })),
    useGetById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  })),
}));

describe('useInventory', () => {
  it('should be defined', () => {
    expect(useInventory).toBeDefined();
  });

  it('should return inventory array', () => {
    const { result } = renderHook(() => useInventory());
    expect(Array.isArray(result.current.inventory)).toBe(true);
  });
});
