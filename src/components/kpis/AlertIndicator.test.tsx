import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import AlertIndicator from './AlertIndicator';
describe('AlertIndicator', () => {
  it('should render', () => {
    const { container } = render(<AlertIndicator type="warning" />);
    expect(container).toBeInTheDocument();
  });
});
