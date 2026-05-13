import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DragHandle } from './DragHandle';

// Mock dependencies if needed
vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('DragHandle', () => {
  it('renders correctly', () => {
    const { container } = render(<DragHandle />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<DragHandle className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
