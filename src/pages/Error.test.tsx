import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Error from './Error';

describe('Error', () => {
  it('should render error page', () => {
    render(<BrowserRouter><Error /></BrowserRouter>);
    expect(screen.getByText('Erro Inesperado')).toBeInTheDocument();
  });
});
