import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGeoWhitelist } from '../hooks/useGeoWhitelist';
import { supabase } from '../integrations/supabase/client';

// Mock Supabase
vi.mock('../integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [{ id: '1', country_code: 'BR', country_name: 'Brasil', is_active: true }], error: null }))
      })),
      insert: vi.fn(() => Promise.resolve({ error: null })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      }))
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'test-user' } }, error: null }))
    }
  }
}));

describe('useGeoWhitelist', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch entries on mount', async () => {
    const { result } = renderHook(() => useGeoWhitelist());
    
    // Wait for fetch to complete (useEffect)
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].country_code).toBe('BR');
  });

  it('should filter available countries', async () => {
    const { result } = renderHook(() => useGeoWhitelist());
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const available = result.current.getAvailableCountries();
    expect(available.find(c => c.code === 'BR')).toBeUndefined();
    expect(available.find(c => c.code === 'US')).toBeDefined();
  });
});