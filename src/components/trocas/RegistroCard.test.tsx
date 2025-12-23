import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import RegistroCard from './RegistroCard';
describe('RegistroCard', () => {
  it('should render', () => {
    const { container } = render(<RegistroCard registro={{ id: '1', tipo: 'troca' }} />);
    expect(container).toBeInTheDocument();
  });
});
