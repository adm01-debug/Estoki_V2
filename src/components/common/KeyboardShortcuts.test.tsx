import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import KeyboardShortcuts from './KeyboardShortcuts';

describe('KeyboardShortcuts', () => {
  it('should render without errors', () => {
    const { container } = render(<KeyboardShortcuts />);
    expect(container).toBeInTheDocument();
  });
});
