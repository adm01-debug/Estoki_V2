import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import StatusBadge from './StatusBadge';
describe('StatusBadge', () => {
  it('should render', () => {
    const { container } = render(<StatusBadge status="pendente" />);
    expect(container).toBeInTheDocument();
  });
});
