import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PrintButton } from './PrintButton';
describe('PrintButton', () => {
  it('should render button', () => {
    render(<PrintButton onPrint={vi.fn()} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
