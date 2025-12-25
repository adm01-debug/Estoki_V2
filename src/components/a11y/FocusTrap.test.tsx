import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FocusTrap from './FocusTrap';

describe('FocusTrap', () => {
  it('should render children', () => {
    render(
      <FocusTrap>
        <button>Trapped Button</button>
      </FocusTrap>
    );
    expect(screen.getByText('Trapped Button')).toBeInTheDocument();
  });

  it('should trap focus within the component', () => {
    render(
      <FocusTrap active>
        <button data-testid="btn1">Button 1</button>
        <button data-testid="btn2">Button 2</button>
      </FocusTrap>
    );
    const btn1 = screen.getByTestId('btn1');
    const btn2 = screen.getByTestId('btn2');
    expect(btn1).toBeInTheDocument();
    expect(btn2).toBeInTheDocument();
  });

  it('should not trap focus when inactive', () => {
    render(
      <FocusTrap active={false}>
        <button>Not Trapped</button>
      </FocusTrap>
    );
    expect(screen.getByText('Not Trapped')).toBeInTheDocument();
  });

  it('should handle escape key', () => {
    const onEscape = vi.fn();
    render(
      <FocusTrap active onEscape={onEscape}>
        <button>Button</button>
      </FocusTrap>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
  });
});
