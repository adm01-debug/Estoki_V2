import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ScannerOCR from './ScannerOCR';

describe('ScannerOCR', () => {
  it('should render without errors', () => {
    const { container } = render(<ScannerOCR />);
    expect(container).toBeInTheDocument();
  });
});
