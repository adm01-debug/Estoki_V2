import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TrocaList from './TrocaList';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn().mockResolvedValue({ data: [], error: null }) })) }
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe('TrocaList', () => {
  it('should render without errors', () => {
    const { container } = render(<TrocaList />, { wrapper });
    expect(container).toBeInTheDocument();
  });
});
