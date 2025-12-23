import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotFound from './NotFound';

describe('NotFound Page', () => {
  it('should render 404 message', () => {
    render(<BrowserRouter><NotFound /></BrowserRouter>);
    expect(screen.getByText(/404|não encontrada|not found/i)).toBeInTheDocument();
  });

  it('should have link to home', () => {
    render(<BrowserRouter><NotFound /></BrowserRouter>);
    expect(screen.getByRole('link')).toBeInTheDocument();
  });
});
