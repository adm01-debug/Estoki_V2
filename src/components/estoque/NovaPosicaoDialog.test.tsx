import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NovaPosicaoDialog from './NovaPosicaoDialog';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn().mockResolvedValue({ data: [], error: null }) })) }
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe('NovaPosicaoDialog', () => {
  it('should render without errors', () => {
    const { container } = render(<NovaPosicaoDialog />, { wrapper });
    expect(container).toBeInTheDocument();
  });
});
