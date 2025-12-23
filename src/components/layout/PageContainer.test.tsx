import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PageContainer from './PageContainer';

describe('PageContainer', () => {
  it('should render without errors', () => {
    const { container } = render(<BrowserRouter><PageContainer /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
