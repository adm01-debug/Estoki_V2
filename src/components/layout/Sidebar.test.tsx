import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Sidebar } from './Sidebar';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { email: 'test@test.com' } }),
}));

describe('Sidebar', () => {
  it('should render navigation links', () => {
    render(<BrowserRouter><Sidebar /></BrowserRouter>);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
