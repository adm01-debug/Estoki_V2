import { render, screen } from '@testing-library/react';
import { PermissionGuard } from './PermissionGuard';
import { useAuth } from '@/contexts/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('PermissionGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner when loading is true', () => {
    (useAuth as any).mockReturnValue({
      loading: true,
      canAccess: vi.fn(),
    });

    render(
      <MemoryRouter>
        <PermissionGuard allowedRoles={['admin', 'supervisor']}>
          <div>Restricted Content</div>
        </PermissionGuard>
      </MemoryRouter>
    );

    expect(screen.getByRole('img', { hidden: true })).toHaveClass('animate-spin');
  });

  it('renders children when user has allowed role', () => {
    const canAccess = vi.fn().mockReturnValue(true);
    (useAuth as any).mockReturnValue({
      loading: false,
      canAccess,
    });

    render(
      <MemoryRouter>
        <PermissionGuard allowedRoles={['admin']}>
          <div>Restricted Content</div>
        </PermissionGuard>
      </MemoryRouter>
    );

    expect(screen.getByText('Restricted Content')).toBeInTheDocument();
    expect(canAccess).toHaveBeenCalledWith(['admin']);
  });

  it('redirects when user does not have allowed role', () => {
    const canAccess = vi.fn().mockReturnValue(false);
    (useAuth as any).mockReturnValue({
      loading: false,
      canAccess,
    });

    render(
      <MemoryRouter>
        <PermissionGuard allowedRoles={['admin']}>
          <div>Restricted Content</div>
        </PermissionGuard>
      </MemoryRouter>
    );

    expect(screen.queryByText('Restricted Content')).not.toBeInTheDocument();
  });
});
