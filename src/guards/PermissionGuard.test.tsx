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
    });

    const { container } = render(
      <MemoryRouter>
        <PermissionGuard permissions="products.read">
          <div>Restricted Content</div>
        </PermissionGuard>
      </MemoryRouter>
    );

    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('animate-spin');
  });

  it('renders children when user has allowed permission', () => {
    (useAuth as any).mockReturnValue({
      user: { id: '123' },
      role: 'admin',
      loading: false,
    });

    render(
      <MemoryRouter>
        <PermissionGuard permissions="products.read">
          <div>Restricted Content</div>
        </PermissionGuard>
      </MemoryRouter>
    );

    expect(screen.getByText('Restricted Content')).toBeInTheDocument();
  });

  it('redirects when user does not have permission', () => {
    (useAuth as any).mockReturnValue({
      user: { id: '123' },
      role: 'operador', // Doesn't have 'users.delete'
      loading: false,
    });

    render(
      <MemoryRouter>
        <PermissionGuard permissions="users.delete">
          <div>Restricted Content</div>
        </PermissionGuard>
      </MemoryRouter>
    );

    expect(screen.queryByText('Restricted Content')).not.toBeInTheDocument();
  });
});
