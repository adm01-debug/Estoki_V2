import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import FotosLoteObrigatorias from './FotosLoteObrigatorias';

describe('FotosLoteObrigatorias', () => {
  it('should render without errors', () => {
    const { container } = render(<FotosLoteObrigatorias />);
    expect(container).toBeInTheDocument();
  });
});
