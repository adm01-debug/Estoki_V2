import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import PrevisaoDemandaIA from './PrevisaoDemandaIA';
describe('PrevisaoDemandaIA', () => {
  it('should render', () => {
    const { container } = render(<PrevisaoDemandaIA />);
    expect(container).toBeInTheDocument();
  });
});
