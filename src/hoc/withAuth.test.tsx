import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import withAuth from './withAuth';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({ isAuthenticated: false, isLoading: false }))
}));

const { useAuth } = await import('@/hooks/useAuth');

const TestComponent = () => <div>Test Component</div>;

describe('withAuth HOC', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should render wrapped component when authenticated', () => {
    (useAuth as any).mockReturnValue({ isAuthenticated: true, isLoading: false });
    const WrappedComponent = withAuth(TestComponent);
    render(<BrowserRouter><WrappedComponent /></BrowserRouter>);
    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });

  it('should redirect when not authenticated', () => {
    (useAuth as any).mockReturnValue({ isAuthenticated: false, isLoading: false });
    const WrappedComponent = withAuth(TestComponent);
    render(<BrowserRouter><WrappedComponent /></BrowserRouter>);
    expect(screen.queryByText('Test Component')).not.toBeInTheDocument();
  });

  it('should show loading during auth check', () => {
    (useAuth as any).mockReturnValue({ isAuthenticated: false, isLoading: true });
    const WrappedComponent = withAuth(TestComponent);
    render(<BrowserRouter><WrappedComponent /></BrowserRouter>);
    expect(screen.queryByText('Test Component')).not.toBeInTheDocument();
  });

  it('should pass props to wrapped component', () => {
    (useAuth as any).mockReturnValue({ isAuthenticated: true, isLoading: false });
    const PropsComponent = ({ title }: { title: string }) => <div>{title}</div>;
    const WrappedComponent = withAuth(PropsComponent);
    render(<BrowserRouter><WrappedComponent title="Hello" /></BrowserRouter>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should preserve component display name', () => {
    const NamedComponent = () => <div>Named</div>;
    NamedComponent.displayName = 'NamedComponent';
    const WrappedComponent = withAuth(NamedComponent);
    expect(WrappedComponent.displayName).toBe('withAuth(NamedComponent)');
  });
});
