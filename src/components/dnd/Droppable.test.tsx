import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Droppable from './Droppable';

describe('Droppable', () => {
  it('should render children', () => {
    render(<Droppable id="drop-zone"><div>Drop Zone</div></Droppable>);
    expect(screen.getByText('Drop Zone')).toBeInTheDocument();
  });

  it('should call onDragOver when dragging over', () => {
    const onDragOver = vi.fn();
    const { container } = render(
      <Droppable id="drop-zone" onDragOver={onDragOver}><div>Zone</div></Droppable>
    );
    fireEvent.dragOver(container.firstChild!);
    expect(onDragOver).toHaveBeenCalled();
  });

  it('should call onDrop when item is dropped', () => {
    const onDrop = vi.fn();
    const { container } = render(
      <Droppable id="drop-zone" onDrop={onDrop}><div>Zone</div></Droppable>
    );
    fireEvent.drop(container.firstChild!);
    expect(onDrop).toHaveBeenCalled();
  });

  it('should highlight on drag enter', () => {
    const { container } = render(
      <Droppable id="drop-zone"><div>Zone</div></Droppable>
    );
    fireEvent.dragEnter(container.firstChild!);
    expect(container.firstChild).toHaveClass('drag-over');
  });

  it('should accept custom className', () => {
    const { container } = render(
      <Droppable id="drop-zone" className="custom-zone"><div>Zone</div></Droppable>
    );
    expect(container.firstChild).toHaveClass('custom-zone');
  });
});
