import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMFA } from '../hooks/useMFA';
import { supabase } from '../integrations/supabase/client';

// Mock Supabase MFA API
vi.mock('../integrations/supabase/client', () => ({
  supabase: {
    auth: {
      mfa: {
        listFactors: vi.fn(() => Promise.resolve({ 
          data: { 
            totp: [{ id: 'f1', factor_type: 'totp', status: 'verified', created_at: '2024-01-01' }],
            phone: [] 
          }, 
          error: null 
        })),
        enroll: vi.fn(),
        challenge: vi.fn(),
        verify: vi.fn(),
        unenroll: vi.fn(),
        getAuthenticatorAssuranceLevel: vi.fn()
      }
    }
  }
}));

describe('useMFA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should list factors correctly', async () => {
    const { result } = renderHook(() => useMFA());
    
    let factors;
    await act(async () => {
      factors = await result.current.listFactors();
    });

    expect(factors).toHaveLength(1);
    expect(factors[0].id).toBe('f1');
    expect(result.current.factors).toHaveLength(1);
  });

  it('should identify if MFA is enabled', async () => {
    const { result } = renderHook(() => useMFA());
    
    let enabled;
    await act(async () => {
      enabled = await result.current.isMFAEnabled();
    });

    expect(enabled).toBe(true);
  });
});