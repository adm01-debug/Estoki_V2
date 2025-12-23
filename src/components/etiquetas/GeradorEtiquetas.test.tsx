import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import GeradorEtiquetas from './GeradorEtiquetas';

describe('GeradorEtiquetas', () => {
  it('should render', () => {
    const { container } = render(<GeradorEtiquetas />);
    expect(container).toBeInTheDocument();
  });
});
