import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PageTransition from './PageTransition';

describe('PageTransition', () => {
  it('should render without errors', () => {
    const { container } = render(<BrowserRouter><PageTransition /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
