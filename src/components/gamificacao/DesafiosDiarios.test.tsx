import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import DesafiosDiarios from './DesafiosDiarios';
describe('DesafiosDiarios', () => {
  it('should render', () => {
    const { container } = render(<DesafiosDiarios />);
    expect(container).toBeInTheDocument();
  });
});
