import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from './Header';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { email: 'test@test.com' } }),
}));

describe('Header', () => {
  it('should render header', () => {
    render(<BrowserRouter><Header /></BrowserRouter>);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});
