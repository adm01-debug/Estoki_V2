import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import NotificacoesGlobais from './NotificacoesGlobais';
describe('NotificacoesGlobais', () => {
  it('should render', () => {
    const { container } = render(<NotificacoesGlobais />);
    expect(container).toBeInTheDocument();
  });
});
