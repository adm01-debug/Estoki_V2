import { render, screen } from '@testing-library/react';
import { RoleGuard } from './RoleGuard';
import { useAuth } from '@/contexts/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('RoleGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner when loading is true', () => {
    (useAuth as any).mockReturnValue({
      loading: true,
      canAccess: vi.fn(),
    });

    const { container } = render(
      <MemoryRouter>
        <RoleGuard allowedRoles={['admin']}>
          <div>Admin Content</div>
        </RoleGuard>
      </MemoryRouter>
    );

    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('animate-spin');
  });

  it('renders children when user has required role', () => {
    const canAccess = vi.fn().mockReturnValue(true);
    (useAuth as any).mockReturnValue({
      user: { id: '123' },
      loading: false,
      canAccess,
    });

    render(
      <MemoryRouter>
        <RoleGuard allowedRoles={['admin']}>
          <div>Admin Content</div>
        </RoleGuard>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
    expect(canAccess).toHaveBeenCalledWith(['admin']);
  });

  it('redirects when user does not have required role', () => {
    const canAccess = vi.fn().mockReturnValue(false);
    (useAuth as any).mockReturnValue({
      user: { id: '123' },
      loading: false,
      canAccess,
    });

    render(
      <MemoryRouter>
        <RoleGuard allowedRoles={['admin']}>
          <div>Admin Content</div>
        </RoleGuard>
      </MemoryRouter>
    );

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });
});
