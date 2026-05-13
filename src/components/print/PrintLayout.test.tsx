import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PrintLayout } from './PrintLayout';

describe('PrintLayout', () => {
  it('should render without crashing', () => {
    render(<PrintLayout />);
  });

  it('should render children', () => {
    render(<PrintLayout>Content</PrintLayout>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should apply A4 portrait styles by default', () => {
    const { container } = render(<PrintLayout>Content</PrintLayout>);
    expect(container.firstChild).toHaveClass('w-[210mm]');
  });
});
