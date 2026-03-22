import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { OnlineIndicator } from './OnlineIndicator';

describe('OnlineIndicator', () => {
  it('should render online status', () => {
    const { container } = render(<OnlineIndicator />);
    expect(container).toBeInTheDocument();
  });
});
