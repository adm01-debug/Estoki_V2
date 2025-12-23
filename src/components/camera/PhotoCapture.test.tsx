import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import PhotoCapture from './PhotoCapture';

describe('PhotoCapture', () => {
  it('should render camera component', () => {
    const { container } = render(<PhotoCapture onCapture={vi.fn()} />);
    expect(container).toBeInTheDocument();
  });
});
