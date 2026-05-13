import { render, screen } from '@testing-library/react';
import { withAuth } from './withAuth';
import { useAuth } from '@/hooks/useAuth';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

const TestComponent = () => <div>Protected</div>;

describe('withAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows default loading spinner when loading is true', () => {
    (useAuth as any).mockReturnValue({
      user: null,
      loading: true,
    });

    const Wrapped = withAuth(TestComponent);
    const { container } = render(
      <MemoryRouter>
        <Wrapped />
      </MemoryRouter>
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('redirects to /auth when user is not logged in', () => {
    (useAuth as any).mockReturnValue({
      user: null,
      loading: false,
    });

    const Wrapped = withAuth(TestComponent);
    render(
      <MemoryRouter initialEntries={['/test']}>
        <Routes>
          <Route path="/test" element={<Wrapped />} />
          <Route path="/auth" element={<div>Auth Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Auth Page')).toBeInTheDocument();
  });

  it('renders WrappedComponent when user is logged in', () => {
    (useAuth as any).mockReturnValue({
      user: { id: '123' },
      loading: false,
    });

    const Wrapped = withAuth(TestComponent);
    render(
      <MemoryRouter>
        <Wrapped />
      </MemoryRouter>
    );

    expect(screen.getByText('Protected')).toBeInTheDocument();
  });
});
