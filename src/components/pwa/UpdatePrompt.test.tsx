import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import UpdatePrompt from './UpdatePrompt';

describe('UpdatePrompt', () => {
  it('should render without errors', () => {
    const { container } = render(<UpdatePrompt />);
    expect(container).toBeInTheDocument();
  });
});
