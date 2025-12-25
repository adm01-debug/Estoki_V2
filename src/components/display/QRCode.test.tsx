import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import QRCode from './QRCode';

describe('QRCode', () => {
  it('should render without crashing', () => {
    render(<QRCode />);
  });

  it('should accept className prop', () => {
    const { container } = render(<QRCode className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should forward ref correctly', () => {
    const ref = { current: null };
    render(<QRCode ref={ref} />);
    expect(ref.current).not.toBeNull();
  });

  it('should handle props correctly', () => {
    const { container } = render(<QRCode data-testid="test-QRCode" />);
    expect(container.querySelector('[data-testid="test-QRCode"]')).toBeInTheDocument();
  });
});
