import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import AmostragemAutomatica from './AmostragemAutomatica';
describe('AmostragemAutomatica', () => {
  it('should render', () => {
    const { container } = render(<AmostragemAutomatica />);
    expect(container).toBeInTheDocument();
  });
});
