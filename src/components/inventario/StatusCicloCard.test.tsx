import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import StatusCicloCard from './StatusCicloCard';
describe('StatusCicloCard', () => {
  it('should render', () => {
    const { container } = render(<StatusCicloCard status="em_andamento" />);
    expect(container).toBeInTheDocument();
  });
});
