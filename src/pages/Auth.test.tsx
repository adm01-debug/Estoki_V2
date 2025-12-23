import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Auth from './Auth';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, loading: false, signIn: vi.fn(), signOut: vi.fn() })
}));

describe('Auth Page', () => {
  const renderAuth = () => render(<BrowserRouter><Auth /></BrowserRouter>);

  it('should render login form', () => {
    renderAuth();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
