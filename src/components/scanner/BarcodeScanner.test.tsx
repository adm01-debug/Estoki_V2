import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BarcodeScanner } from './BarcodeScanner';

describe('BarcodeScanner', () => {
  it('should render scanner', () => {
    render(<BarcodeScanner onScan={vi.fn()} />);
    expect(screen.getByRole('region')).toBeInTheDocument();
  });
});
