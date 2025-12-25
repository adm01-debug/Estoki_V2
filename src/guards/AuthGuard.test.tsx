import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AuthGuard from './AuthGuard';

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({ isAuthenticated: false, isLoading: false }))
}));

const { useAuth } = await import('@/hooks/useAuth');

describe('AuthGuard', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should render children when authenticated', () => {
    (useAuth as any).mockReturnValue({ isAuthenticated: true, isLoading: false });
    render(
      <BrowserRouter>
        <AuthGuard><div>Protected Content</div></AuthGuard>
      </BrowserRouter>
    );
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect when not authenticated', () => {
    (useAuth as any).mockReturnValue({ isAuthenticated: false, isLoading: false });
    render(
      <BrowserRouter>
        <AuthGuard><div>Protected Content</div></AuthGuard>
      </BrowserRouter>
    );
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should show loading state', () => {
    (useAuth as any).mockReturnValue({ isAuthenticated: false, isLoading: true });
    render(
      <BrowserRouter>
        <AuthGuard><div>Protected Content</div></AuthGuard>
      </BrowserRouter>
    );
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should accept custom fallback path', () => {
    (useAuth as any).mockReturnValue({ isAuthenticated: false, isLoading: false });
    render(
      <BrowserRouter>
        <AuthGuard fallbackPath="/custom-login"><div>Content</div></AuthGuard>
      </BrowserRouter>
    );
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });
});
