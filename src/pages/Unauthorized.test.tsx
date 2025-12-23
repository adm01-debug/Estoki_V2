import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Unauthorized from './Unauthorized';

describe('Unauthorized', () => {
  it('should render unauthorized page', () => {
    render(<BrowserRouter><Unauthorized /></BrowserRouter>);
    expect(screen.getByText('Acesso Negado')).toBeInTheDocument();
  });
});
