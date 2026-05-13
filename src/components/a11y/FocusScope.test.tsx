import { render, screen } from '@testing-library/react';
import { FocusScope } from './FocusScope';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

describe('FocusScope', () => {
  it('renders children correctly', () => {
    render(
      <FocusScope>
        <button>Test Button</button>
      </FocusScope>
    );
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('autofocuses the first focusable element when autoFocus is true', () => {
    render(
      <FocusScope autoFocus={true}>
        <div>
          <span>Not focusable</span>
          <button>Focus Me</button>
        </div>
      </FocusScope>
    );
    const button = screen.getByText('Focus Me');
    expect(document.activeElement).toBe(button);
  });

  it('does not autofocus when autoFocus is false', () => {
    render(
      <FocusScope autoFocus={false}>
        <button>Don't Focus Me</button>
      </FocusScope>
    );
    const button = screen.getByText("Don't Focus Me");
    expect(document.activeElement).not.toBe(button);
  });
});
