import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PrintFooter from './PrintFooter';

describe('PrintFooter', () => {
  it('should render without crashing', () => {
    render(<PrintFooter />);
  });

  it('should render children', () => {
    render(<PrintFooter><div>Print Content</div></PrintFooter>);
    expect(screen.getByText('Print Content')).toBeInTheDocument();
  });

  it('should accept className prop', () => {
    const { container } = render(<PrintFooter className="print-class" />);
    expect(container.firstChild).toHaveClass('print-class');
  });

  it('should apply print-only styles', () => {
    const { container } = render(<PrintFooter printOnly />);
    expect(container.firstChild).toHaveClass('print-only');
  });

  it('should handle page break settings', () => {
    const { container } = render(<PrintFooter pageBreak="before" />);
    expect(container.firstChild).toHaveStyle({ pageBreakBefore: 'always' });
  });
});
