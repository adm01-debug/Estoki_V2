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
      hasRole: vi.fn(),
    });

    render(
      <MemoryRouter>
        <RoleGuard requiredRole="admin">
          <div>Admin Content</div>
        </RoleGuard>
      </MemoryRouter>
    );

    expect(screen.getByRole('img', { hidden: true })).toHaveClass('animate-spin');
  });

  it('renders children when user has required role', () => {
    const hasRole = vi.fn().mockReturnValue(true);
    (useAuth as any).mockReturnValue({
      loading: false,
      hasRole,
    });

    render(
      <MemoryRouter>
        <RoleGuard requiredRole="admin">
          <div>Admin Content</div>
        </RoleGuard>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
    expect(hasRole).toHaveBeenCalledWith('admin');
  });

  it('redirects to unauthorized when user does not have required role', () => {
    const hasRole = vi.fn().mockReturnValue(false);
    (useAuth as any).mockReturnValue({
      loading: false,
      hasRole,
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <div>
          <RoleGuard requiredRole="admin">
            <div>Admin Content</div>
          </RoleGuard>
        </div>
      </MemoryRouter>
    );

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });
});
