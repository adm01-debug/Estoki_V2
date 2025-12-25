import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from './DashboardPage';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { name: 'Test' }, isAuthenticated: true })
}));

describe('DashboardPage', () => {
  it('should render without crashing', () => {
    render(<BrowserRouter><DashboardPage /></BrowserRouter>);
  });

  it('should display dashboard content', () => {
    render(<BrowserRouter><DashboardPage /></BrowserRouter>);
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });
});
