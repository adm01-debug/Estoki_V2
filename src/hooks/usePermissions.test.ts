import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePermissions } from './usePermissions';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'admin' } })
}));

describe('usePermissions', () => {
  it('should check admin permissions', () => {
    const { result } = renderHook(() => usePermissions());
    expect(result.current.isAdmin()).toBe(true);
    expect(result.current.canWrite()).toBe(true);
  });
});
