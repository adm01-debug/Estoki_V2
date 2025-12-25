import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import PermissionGuard from './PermissionGuard';

vi.mock('@/hooks/usePermission', () => ({
  usePermission: vi.fn(() => ({ permissions: [], hasPermission: vi.fn() }))
}));

const { usePermission } = await import('@/hooks/usePermission');

describe('PermissionGuard', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should render children when user has required permission', () => {
    (usePermission as any).mockReturnValue({ 
      permissions: ['read:users'], 
      hasPermission: (p: string) => p === 'read:users' 
    });
    render(
      <BrowserRouter>
        <PermissionGuard requiredPermissions={['read:users']}><div>Users List</div></PermissionGuard>
      </BrowserRouter>
    );
    expect(screen.getByText('Users List')).toBeInTheDocument();
  });

  it('should not render when user lacks permission', () => {
    (usePermission as any).mockReturnValue({ 
      permissions: [], 
      hasPermission: () => false 
    });
    render(
      <BrowserRouter>
        <PermissionGuard requiredPermissions={['delete:users']}><div>Delete Button</div></PermissionGuard>
      </BrowserRouter>
    );
    expect(screen.queryByText('Delete Button')).not.toBeInTheDocument();
  });

  it('should check multiple permissions with ANY mode', () => {
    (usePermission as any).mockReturnValue({ 
      permissions: ['write:products'], 
      hasPermission: (p: string) => p === 'write:products' 
    });
    render(
      <BrowserRouter>
        <PermissionGuard requiredPermissions={['read:products', 'write:products']} mode="any">
          <div>Product Form</div>
        </PermissionGuard>
      </BrowserRouter>
    );
    expect(screen.getByText('Product Form')).toBeInTheDocument();
  });

  it('should check multiple permissions with ALL mode', () => {
    (usePermission as any).mockReturnValue({ 
      permissions: ['read:orders'], 
      hasPermission: (p: string) => p === 'read:orders' 
    });
    render(
      <BrowserRouter>
        <PermissionGuard requiredPermissions={['read:orders', 'write:orders']} mode="all">
          <div>Order Editor</div>
        </PermissionGuard>
      </BrowserRouter>
    );
    expect(screen.queryByText('Order Editor')).not.toBeInTheDocument();
  });

  it('should render custom fallback', () => {
    (usePermission as any).mockReturnValue({ permissions: [], hasPermission: () => false });
    render(
      <BrowserRouter>
        <PermissionGuard 
          requiredPermissions={['admin:all']} 
          fallback={<div>No Permission</div>}
        >
          <div>Admin Panel</div>
        </PermissionGuard>
      </BrowserRouter>
    );
    expect(screen.getByText('No Permission')).toBeInTheDocument();
  });
});
