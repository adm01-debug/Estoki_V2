import { render, screen } from '@testing-library/react';
import { FocusTrap } from './FocusTrap';
import { describe, it, expect } from 'vitest';

describe('FocusTrap', () => {
  it('focuses the first element when active', () => {
    render(
      <FocusTrap>
        <button data-testid="btn">Button</button>
      </FocusTrap>
    );

    expect(document.activeElement).toBe(screen.getByTestId('btn'));
  });

  it('does nothing when inactive', () => {
    render(
      <FocusTrap active={false}>
        <button data-testid="btn">Button</button>
      </FocusTrap>
    );

    expect(document.activeElement).not.toBe(screen.getByTestId('btn'));
  });
});
