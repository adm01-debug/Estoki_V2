import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { AssinaturaDigital } from './AssinaturaDigital';

describe('AssinaturaDigital', () => {
  it('should render signature pad', () => {
    const { container } = render(<AssinaturaDigital onSave={vi.fn()} />);
    expect(container).toBeInTheDocument();
  });
});
