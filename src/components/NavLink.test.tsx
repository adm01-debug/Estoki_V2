import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NavLink from './NavLink';

describe('NavLink', () => {
  it('should render link', () => {
    render(<BrowserRouter><NavLink to="/test">Test</NavLink></BrowserRouter>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should have correct href', () => {
    render(<BrowserRouter><NavLink to="/dashboard">Dashboard</NavLink></BrowserRouter>);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/dashboard');
  });
});
