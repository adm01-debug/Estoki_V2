import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ConquistaNotificacoes from './ConquistaNotificacoes';

describe('ConquistaNotificacoes', () => {
  it('should render', () => {
    const { container } = render(<ConquistaNotificacoes />);
    expect(container).toBeInTheDocument();
  });
});
