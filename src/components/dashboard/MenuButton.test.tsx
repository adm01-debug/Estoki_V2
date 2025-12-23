import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import MenuButton from './MenuButton';

describe('MenuButton', () => {
  it('should render without errors', () => {
    const { container } = render(<MenuButton />);
    expect(container).toBeInTheDocument();
  });
});
