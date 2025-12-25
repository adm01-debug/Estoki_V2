import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import RoleGuard from './RoleGuard';

vi.mock('@/hooks/useRoles', () => ({
  useRoles: vi.fn(() => ({ roles: [], hasRole: vi.fn() }))
}));

const { useRoles } = await import('@/hooks/useRoles');

describe('RoleGuard', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should render children when user has required role', () => {
    (useRoles as any).mockReturnValue({ roles: ['admin'], hasRole: (r: string) => r === 'admin' });
    render(
      <BrowserRouter>
        <RoleGuard requiredRoles={['admin']}><div>Admin Content</div></RoleGuard>
      </BrowserRouter>
    );
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('should not render when user lacks required role', () => {
    (useRoles as any).mockReturnValue({ roles: ['user'], hasRole: (r: string) => r === 'user' });
    render(
      <BrowserRouter>
        <RoleGuard requiredRoles={['admin']}><div>Admin Content</div></RoleGuard>
      </BrowserRouter>
    );
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('should handle multiple required roles with ANY mode', () => {
    (useRoles as any).mockReturnValue({ roles: ['editor'], hasRole: (r: string) => r === 'editor' });
    render(
      <BrowserRouter>
        <RoleGuard requiredRoles={['admin', 'editor']} mode="any"><div>Content</div></RoleGuard>
      </BrowserRouter>
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should handle multiple required roles with ALL mode', () => {
    (useRoles as any).mockReturnValue({ roles: ['admin'], hasRole: (r: string) => r === 'admin' });
    render(
      <BrowserRouter>
        <RoleGuard requiredRoles={['admin', 'editor']} mode="all"><div>Content</div></RoleGuard>
      </BrowserRouter>
    );
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('should render fallback component when unauthorized', () => {
    (useRoles as any).mockReturnValue({ roles: [], hasRole: () => false });
    render(
      <BrowserRouter>
        <RoleGuard requiredRoles={['admin']} fallback={<div>Access Denied</div>}>
          <div>Content</div>
        </RoleGuard>
      </BrowserRouter>
    );
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
  });
});
