import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import PosicaoStatusBadge from './PosicaoStatusBadge';

describe('PosicaoStatusBadge', () => {
  it('should render status badge', () => {
    const { container } = render(<PosicaoStatusBadge status="disponivel" />);
    expect(container).toBeInTheDocument();
  });
});
