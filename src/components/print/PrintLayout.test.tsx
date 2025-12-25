import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PrintLayout from './PrintLayout';

describe('PrintLayout', () => {
  it('should render without crashing', () => {
    render(<PrintLayout />);
  });

  it('should render children', () => {
    render(<PrintLayout><div>Print Content</div></PrintLayout>);
    expect(screen.getByText('Print Content')).toBeInTheDocument();
  });

  it('should accept className prop', () => {
    const { container } = render(<PrintLayout className="print-class" />);
    expect(container.firstChild).toHaveClass('print-class');
  });

  it('should apply print-only styles', () => {
    const { container } = render(<PrintLayout printOnly />);
    expect(container.firstChild).toHaveClass('print-only');
  });

  it('should handle page break settings', () => {
    const { container } = render(<PrintLayout pageBreak="before" />);
    expect(container.firstChild).toHaveStyle({ pageBreakBefore: 'always' });
  });
});
