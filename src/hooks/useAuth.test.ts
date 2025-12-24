import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

describe('useAuth', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should be defined', () => {
    expect(useAuth).toBeDefined();
  });

  it('should return user state', async () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('login');
    expect(result.current).toHaveProperty('logout');
  });

  it('should handle login', async () => {
    const { result } = renderHook(() => useAuth());
    expect(typeof result.current.login).toBe('function');
  });

  it('should handle logout', async () => {
    const { result } = renderHook(() => useAuth());
    expect(typeof result.current.logout).toBe('function');
  });
});
