import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import TipoBadge from './TipoBadge';
describe('TipoBadge', () => {
  it('should render', () => {
    const { container } = render(<TipoBadge tipo="troca" />);
    expect(container).toBeInTheDocument();
  });
});
