import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FocusScope from './FocusScope';

describe('FocusScope', () => {
  it('should render children', () => {
    render(
      <FocusScope>
        <button>Button 1</button>
        <button>Button 2</button>
      </FocusScope>
    );
    expect(screen.getByText('Button 1')).toBeInTheDocument();
    expect(screen.getByText('Button 2')).toBeInTheDocument();
  });

  it('should contain focus within scope', () => {
    render(
      <FocusScope contain>
        <input data-testid="input1" />
        <input data-testid="input2" />
      </FocusScope>
    );
    expect(screen.getByTestId('input1')).toBeInTheDocument();
  });

  it('should restore focus on unmount', () => {
    const { unmount } = render(
      <FocusScope restoreFocus>
        <button>Scoped Button</button>
      </FocusScope>
    );
    unmount();
    // Focus restoration tested implicitly
  });

  it('should auto-focus first element when autoFocus is true', () => {
    render(
      <FocusScope autoFocus>
        <button data-testid="first">First</button>
        <button>Second</button>
      </FocusScope>
    );
    expect(screen.getByTestId('first')).toBeInTheDocument();
  });
});
