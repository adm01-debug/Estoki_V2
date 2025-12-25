import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PrintPreview from './PrintPreview';

describe('PrintPreview', () => {
  it('should render without crashing', () => {
    render(<PrintPreview />);
  });

  it('should render children', () => {
    render(<PrintPreview><div>Print Content</div></PrintPreview>);
    expect(screen.getByText('Print Content')).toBeInTheDocument();
  });

  it('should accept className prop', () => {
    const { container } = render(<PrintPreview className="print-class" />);
    expect(container.firstChild).toHaveClass('print-class');
  });

  it('should apply print-only styles', () => {
    const { container } = render(<PrintPreview printOnly />);
    expect(container.firstChild).toHaveClass('print-only');
  });

  it('should handle page break settings', () => {
    const { container } = render(<PrintPreview pageBreak="before" />);
    expect(container.firstChild).toHaveStyle({ pageBreakBefore: 'always' });
  });
});
