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

  it('renders login form with email field', () => {
    renderAuth();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders login form with password field', () => {
    renderAuth();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
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

  it('renders the ESTOKI brand in heading', () => {
    renderAuth();
    expect(screen.getByRole('heading', { name: /ESTOKI/i })).toBeInTheDocument();
  });

  it('does not render any inline HSL styles', () => {
    const { container } = renderAuth();
    const html = container.innerHTML;
    expect(html).not.toMatch(/style="[^"]*hsl\(\d/);
  });

  it('uses semantic token classes instead of hardcoded colors', () => {
    const { container } = renderAuth();
    const html = container.innerHTML;
    // Should use sidebar-foreground tokens, not raw HSL
    expect(html).not.toMatch(/bg-\[hsl\(/);
  });
});
