import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TextareaCounter } from './TextareaCounter';

describe('TextareaCounter', () => {
  it('renders label and counter', () => {
    render(<TextareaCounter label="Comments" value="Hello" maxLength={10} />);
    expect(screen.getByText('Comments')).toBeInTheDocument();
    expect(screen.getByText('5/10')).toBeInTheDocument();
  });

  it('calls onChange when text is entered', () => {
    const onChange = vi.fn();
    render(<TextareaCounter onChange={onChange} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'New text' } });
    expect(onChange).toHaveBeenCalledWith('New text');
  });

  it('shows error class when over limit', () => {
    const { container } = render(<TextareaCounter value="Too long" maxLength={5} />);
    const textarea = container.querySelector('textarea');
    expect(textarea).toHaveClass('border-red-500');
  });
});
