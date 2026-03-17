import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: '1' }, error: null }),
    })),
  },
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-user-id' }, role: 'admin', loading: false }),
}));

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(QueryClientProvider, { client: new QueryClient({ defaultOptions: { queries: { retry: false } } }) }, children);

import { useCustodiaTransferencias, useCheckpointsZona, useOcorrenciasPerda } from './useGovernanca';

describe('useGovernanca hooks', () => {
  it('useCustodiaTransferencias should initialize', () => {
    const { result } = renderHook(() => useCustodiaTransferencias(), { wrapper });
    expect(result.current.transferencias).toBeDefined();
    expect(result.current.criarTransferencia).toBeDefined();
    expect(result.current.confirmarRecebimento).toBeDefined();
  });

  it('useCheckpointsZona should initialize', () => {
    const { result } = renderHook(() => useCheckpointsZona(), { wrapper });
    expect(result.current.checkpoints).toBeDefined();
    expect(result.current.registrarCheckpoint).toBeDefined();
    expect(result.current.itensPresos).toBeDefined();
  });

  it('useOcorrenciasPerda should initialize', () => {
    const { result } = renderHook(() => useOcorrenciasPerda(), { wrapper });
    expect(result.current.ocorrencias).toBeDefined();
    expect(result.current.criarOcorrencia).toBeDefined();
    expect(result.current.atualizarOcorrencia).toBeDefined();
    expect(result.current.stats).toBeDefined();
  });
});
