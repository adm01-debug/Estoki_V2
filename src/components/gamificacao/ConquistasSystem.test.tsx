import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ConquistasSystem from './ConquistasSystem';

describe('ConquistasSystem', () => {
  it('should render', () => {
    const { container } = render(<ConquistasSystem />);
    expect(container).toBeInTheDocument();
  });
});
