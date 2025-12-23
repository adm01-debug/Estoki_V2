import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Footer from './Footer';

describe('Footer', () => {
  it('should render footer', () => {
    const { container } = render(<Footer />);
    expect(container).toBeInTheDocument();
  });
});
