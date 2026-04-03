import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Auth from './Auth';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signIn: vi.fn().mockResolvedValue({ error: null }),
    signUp: vi.fn().mockResolvedValue({ error: null }),
    signOut: vi.fn(),
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
  useToast: () => ({ toast: vi.fn() }),
}));

describe('Auth Page', () => {
  const renderAuth = () => render(<BrowserRouter><Auth /></BrowserRouter>);

  it('renders login form with email and password fields', () => {
    renderAuth();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
  });

  it('renders login button', () => {
    renderAuth();
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders tabs for login and signup', () => {
    renderAuth();
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('renders the ESTOKI brand', () => {
    renderAuth();
    expect(screen.getByText(/ESTOKI/i)).toBeInTheDocument();
  });

  it('does not render any hardcoded HSL values in the DOM', () => {
    const { container } = renderAuth();
    const html = container.innerHTML;
    // Ensure no raw hsl( values leaked into inline styles
    expect(html).not.toMatch(/style="[^"]*hsl\(\d/);
  });
});
