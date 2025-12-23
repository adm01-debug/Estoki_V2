import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Scanner from './Scanner';

vi.mock('@/components/scanner/QRScanner', () => ({ default: () => <div>QR Scanner</div> }));

describe('Scanner Page', () => {
  it('should render scanner component', () => {
    render(<BrowserRouter><Scanner /></BrowserRouter>);
    expect(screen.getByText(/scanner|qr/i)).toBeInTheDocument();
  });
});
