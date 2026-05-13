import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { YearPicker } from './YearPicker';

describe('YearPicker', () => {
  it('renders current year if provided', () => {
    render(<YearPicker value={2024} />);
    expect(screen.getByText('2024')).toBeInTheDocument();
  });

  it('calls onChange when a year is selected', () => {
    const onChange = vi.fn();
    render(<YearPicker onChange={onChange} />);
    fireEvent.click(screen.getByText('Selecionar ano'));
    fireEvent.click(screen.getByText('2024'));
    expect(onChange).toHaveBeenCalledWith(2024);
  });
});
