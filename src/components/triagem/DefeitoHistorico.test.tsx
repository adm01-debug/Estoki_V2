import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import DefeitoHistorico from './DefeitoHistorico';
describe('DefeitoHistorico', () => {
  it('should render', () => {
    const { container } = render(<DefeitoHistorico />);
    expect(container).toBeInTheDocument();
  });
});
