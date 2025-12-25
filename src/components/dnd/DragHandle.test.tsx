import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DragHandle from './DragHandle';

describe('DragHandle', () => {
  it('should render without crashing', () => {
    render(<DragHandle />);
  });

  it('should have draggable cursor style', () => {
    const { container } = render(<DragHandle />);
    expect(container.firstChild).toHaveStyle({ cursor: 'grab' });
  });

  it('should accept className prop', () => {
    const { container } = render(<DragHandle className="custom-handle" />);
    expect(container.firstChild).toHaveClass('custom-handle');
  });

  it('should render with accessibility attributes', () => {
    render(<DragHandle aria-label="Drag to reorder" />);
    expect(screen.getByLabelText('Drag to reorder')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    const { container } = render(<DragHandle disabled />);
    expect(container.firstChild).toHaveAttribute('aria-disabled', 'true');
  });
});
