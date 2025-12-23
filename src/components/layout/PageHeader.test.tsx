import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PageHeader from './PageHeader';

describe('PageHeader', () => {
  it('should render without errors', () => {
    const { container } = render(<BrowserRouter><PageHeader /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
