import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import AssinaturaConferenciaDialog from './AssinaturaConferenciaDialog';

describe('AssinaturaConferenciaDialog', () => {
  it('should render dialog', () => {
    const { container } = render(<AssinaturaConferenciaDialog open={true} onClose={vi.fn()} />);
    expect(container).toBeInTheDocument();
  });
});
