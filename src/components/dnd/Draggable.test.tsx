import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Draggable from './Draggable';

describe('Draggable', () => {
  it('should render children', () => {
    render(<Draggable id="test"><div>Draggable Content</div></Draggable>);
    expect(screen.getByText('Draggable Content')).toBeInTheDocument();
  });

  it('should have draggable attribute', () => {
    const { container } = render(<Draggable id="test"><div>Content</div></Draggable>);
    expect(container.firstChild).toHaveAttribute('draggable', 'true');
  });

  it('should call onDragStart when dragging starts', () => {
    const onDragStart = vi.fn();
    const { container } = render(
      <Draggable id="test" onDragStart={onDragStart}><div>Content</div></Draggable>
    );
    fireEvent.dragStart(container.firstChild!);
    expect(onDragStart).toHaveBeenCalled();
  });

  it('should call onDragEnd when dragging ends', () => {
    const onDragEnd = vi.fn();
    const { container } = render(
      <Draggable id="test" onDragEnd={onDragEnd}><div>Content</div></Draggable>
    );
    fireEvent.dragEnd(container.firstChild!);
    expect(onDragEnd).toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    const { container } = render(
      <Draggable id="test" disabled><div>Content</div></Draggable>
    );
    expect(container.firstChild).toHaveAttribute('draggable', 'false');
  });
});
