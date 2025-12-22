import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './Dashboard';

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: '1' } }) }));
vi.mock('@/hooks/useDashboard', () => ({ useDashboard: () => ({ data: {}, loading: false }) }));

describe('Dashboard', () => {
  it('should render dashboard page', () => {
    render(<BrowserRouter><Dashboard /></BrowserRouter>);
    expect(document.body).toBeInTheDocument();
  });
});
