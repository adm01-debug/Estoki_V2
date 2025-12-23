import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PosicaoGrid from './PosicaoGrid';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn().mockResolvedValue({ data: [], error: null }) })) }
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe('PosicaoGrid', () => {
  it('should render without errors', () => {
    const { container } = render(<PosicaoGrid />, { wrapper });
    expect(container).toBeInTheDocument();
  });
});
