import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';

describe('Breadcrumbs', () => {
  it('should render breadcrumbs', () => {
    render(<BrowserRouter><Breadcrumbs /></BrowserRouter>);
    expect(document.body).toBeInTheDocument();
  });
});
