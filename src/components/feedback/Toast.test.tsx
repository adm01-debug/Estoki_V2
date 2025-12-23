import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Toast } from './Toast';

describe('Toast', () => {
  it('should render toast', () => {
    const { container } = render(<Toast>Message</Toast>);
    expect(container).toBeInTheDocument();
  });
});
