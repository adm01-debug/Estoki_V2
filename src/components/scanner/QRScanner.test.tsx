import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QRScanner } from './QRScanner';

describe('QRScanner', () => {
  it('should render scanner component', () => {
    render(<QRScanner onScan={() => {}} />);
    expect(screen.getByText(/scanner/i)).toBeInTheDocument();
  });
});
